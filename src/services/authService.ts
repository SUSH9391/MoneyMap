
import * as crypto from 'node:crypto';

import { db } from '../../prisma/db.js';
import { config } from '../config/index.js';

import { hashPassword, comparePassword } from '../utils/password.js';

import {
    generateRefreshToken,
    hashToken,
    getRefreshTokenExpiry,
   
} from '../utils/refreshToken.js';
import { signAccessToken } from '../utils/jwt.js';
import { sendPasswordResetEmail } from '../utils/email.js';

import {
    ValidationError,
    UnauthorizedError,
    ConflictError
} from '../utils/errors.js';

interface RegisterData {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

interface LoginData {
    email: string;
    password: string;
}

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

interface AuthResponse {
    user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
    };
    accessToken: string;
    refreshToken: string;
}


class AuthService {

    private async issueTokenPair(userId: string, email: string): Promise<AuthTokens> {

        const accessToken = signAccessToken({ userId, email });

        const { raw, hashed } = generateRefreshToken();

        await db.orm.public.RefreshToken.create({
            tokenHash: hashed,
            userId,
            expiresAt: getRefreshTokenExpiry(30)
        });

        return {
            accessToken,
            refreshToken: raw
        };
    }


    async register(data: RegisterData): Promise<AuthResponse> {

        const existingUser = await db.orm.public.User
            .where({ email: data.email })
            .first();

        if (existingUser) {
            throw new ConflictError('User with this email already exists');
        }

        const hashedPassword = await hashPassword(data.password);

        const user = await db.orm.public.User.create({
            email: data.email,
            password: hashedPassword,
            firstName: data.firstName ?? null,
            lastName: data.lastName ?? null
        });

        const { accessToken, refreshToken } =
            await this.issueTokenPair(user.id, user.email);

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            },
            accessToken,
            refreshToken
        };
    }


    async login(data: LoginData): Promise<AuthResponse> {

        const user = await db.orm.public.User
            .where({ email: data.email })
            .first();

        if (!user) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const isPasswordValid = await comparePassword(
            data.password,
            user.password
        );

        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const { accessToken, refreshToken } =
            await this.issueTokenPair(user.id, user.email);

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            },
            accessToken,
            refreshToken
        };
    }


    /**
     * Refresh token rotation:
     *
     * 1. Hash the incoming refresh token.
     * 2. Find the corresponding stored token.
     * 3. Check whether it exists, is revoked, or expired.
     * 4. Revoke the old token.
     * 5. Generate a new access and refresh token pair.
     */

    async refresh(rawRefreshToken: string): Promise<AuthTokens> {

        const tokenHash = hashToken(rawRefreshToken);

        const storedToken = await db.orm.public.RefreshToken
            .where({ tokenHash })
            .first();

        if (!storedToken) {
            throw new UnauthorizedError('Invalid refresh token');
        }

        if (storedToken.isRevoked) {

            // Possible refresh-token reuse.
            // Revoke all tokens belonging to this user.

            await db.orm.public.RefreshToken
                .where({ userId: storedToken.userId })
                .update({
                    isRevoked: true
                });

            throw new UnauthorizedError('Refresh token has been revoked');
        }

        if (storedToken.expiresAt < new Date()) {
            throw new UnauthorizedError('Refresh token has expired');
        }

        // Revoke the previous refresh token.
        await db.orm.public.RefreshToken
            .where({ id: storedToken.id })
            .update({
                isRevoked: true
            });

        const user = await db.orm.public.User
            .where({ id: storedToken.userId })
            .first();

        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        // Issue a completely new token pair.
        return this.issueTokenPair(user.id, user.email);
    }
    /**
     * Revoke a specific refresh token on logout.
     * If the raw token is not provided, revoke ALL tokens for the user (logout everywhere).
     */
    async logout(userId: string, rawRefreshToken?: string): Promise<void> {

        if (rawRefreshToken) {

            const tokenHash = hashToken(rawRefreshToken);

            // Revoke only the specified refresh token
            await db.orm.public.RefreshToken
                .where({
                    tokenHash,
                    userId
                })
                .update({
                    isRevoked: true
                });

        } else {

            // Revoke all refresh tokens belonging to the user
            await db.orm.public.RefreshToken
                .where({ userId })
                .update({
                    isRevoked: true
                });

        }
    }
    
async getMe(userId: string) {
    const user = await db.orm.public.User
        .where({ id: userId })
        .first();

    if (!user) {
        throw new UnauthorizedError('User not found');
    }

    // Return only public user information.
    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        isDiscoverable: user.isDiscoverable,
        onboardingDone: user.onboardingDone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}


// ─── Forgot Password ─────────────────────────────────────────────

/**
 * Initiate a password reset.
 *
 * 1. Find the user by email.
 * 2. Invalidate previous unused reset tokens.
 * 3. Generate a new secure reset token.
 * 4. Store only its hash in the database.
 * 5. Send the raw token through email.
 */
async forgotPassword(email: string): Promise<void> {

    const user = await db.orm.public.User
        .where({ email })
        .first();

    // Don't reveal whether the email exists.
    if (!user) {
        return;
    }

    // Invalidate previous unused reset tokens.
    await db.orm.public.PasswordResetToken
        .where({
            userId: user.id,
            usedAt: null,
        })
        .update({
            usedAt: new Date(),
        });

    // Generate a secure random token.
    const rawToken = crypto.randomBytes(32).toString('hex');

    // Hash token before storing it.
    const tokenHash = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

    const expiryMinutes = config.passwordResetExpiryMinutes;

    const expiresAt = new Date(
        Date.now() + expiryMinutes * 60 * 1000
    );

    await db.orm.public.PasswordResetToken.create({
        tokenHash,
        userId: user.id,
        expiresAt,
    });

    // Send raw token through email.
    const resetUrl = `${config.appDeepLinkBase}?token=${rawToken}`;

    await sendPasswordResetEmail(
        user.email,
        user.firstName,
        resetUrl,
        expiryMinutes
    );
}


// ─── Reset Password ──────────────────────────────────────────────

/**
 * Complete a password reset.
 *
 * 1. Hash the incoming reset token.
 * 2. Find and validate the token.
 * 3. Hash the new password.
 * 4. Update the user's password.
 * 5. Mark reset token as used.
 * 6. Revoke all refresh tokens.
 */
async resetPassword(
    rawToken: string,
    newPassword: string
): Promise<void> {

    // Hash the incoming token.
    const tokenHash = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

    // Find the reset token.
    const resetToken = await db.orm.public.PasswordResetToken
        .where({ tokenHash })
        .first();

    if (!resetToken) {
        throw new ValidationError(
            'Invalid or expired password reset token'
        );
    }

    if (resetToken.usedAt) {
        throw new ValidationError(
            'This password reset link has already been used'
        );
    }

    if (resetToken.expiresAt < new Date()) {
        throw new ValidationError(
            'Password reset link has expired. Please request a new one'
        );
    }

    // Hash the new password.
    const hashedPassword = await hashPassword(newPassword);

    // Update user password.
    await db.orm.public.User
        .where({ id: resetToken.userId })
        .update({
            password: hashedPassword,
        });

    // Mark reset token as used.
    await db.orm.public.PasswordResetToken
        .where({ id: resetToken.id })
        .update({
            usedAt: new Date(),
        });

    // Revoke all refresh tokens (logout from all devices).
    await db.orm.public.RefreshToken
        .where({ userId: resetToken.userId })
        .update({
            isRevoked: true,
        });
}

}

export default new AuthService();
