import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { UnauthorizedError } from '../utils/errors.js';
import authService from '../services/authService.js';

class AuthController {
    /**
     * Register
     * @route POST /api/auth/register
     */
    register = asyncHandler(async (req: Request, res: Response) => {
        const { email, password, firstName, lastName } = req.body;

        const result = await authService.register({ email, password, firstName, lastName });

        res.status(201).json({
            success: true,
            data: result,
            message: 'User registered successfully',
        });
    });

    /**
 * Login user — returns access token + refresh token
 * @route POST /api/auth/login
 */
    login = asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const result = await authService.login({ email, password });

        res.json({
            success: true,
            data: result,
            message: 'Login successful',
        });
    });
    /**
       * Refresh access token using a valid refresh token.
       * Implements token rotation: the old refresh token is revoked and a new pair is issued.
       * @route POST /api/auth/refresh
       */
    refreshToken = asyncHandler(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new UnauthorizedError('Refresh token is required');
        }

        const tokens = await authService.refresh(refreshToken);

        res.json({
            success: true,
            data: tokens,
            message: 'Tokens refreshed successfully',
        });
    });
    /**
  * Get current user
  * @route GET /api/auth/me
  */
    getMe = asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new UnauthorizedError('User not authenticated');
        }

        const user = await authService.getMe(req.user.userId);

        res.json({
            success: true,
            data: user,
        });
    });
    /**
   * Logout — revokes the provided refresh token.
   * Pass refreshToken in body to revoke just this device.
   * Omit refreshToken to revoke all devices (logout everywhere).
   * @route POST /api/auth/logout
   */
    logout = asyncHandler(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;
        const userId = req.user!.userId;

        await authService.logout(userId, refreshToken);

        res.json({
            success: true,
            message: 'Logout successful',
        });
    });
    /**
   * Request a password reset email.
   * Always returns 200 to prevent user enumeration — even if the email
   * is not in the database the response is identical.
   * @route POST /api/auth/forgot-password
   */
  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    await authService.forgotPassword(email);

    res.json({
      success: true,
      message: 'If that email is registered, a password reset link has been sent.',
    });
  });
   /**
   * Complete a password reset using a valid reset token.
   * On success all refresh tokens are revoked (user must re-login on all devices).
   * @route POST /api/auth/reset-password
   */
  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    await authService.resetPassword(token, newPassword);

    res.json({
      success: true,
      message: 'Password reset successfully. Please log in with your new password.',
    });
  });
}
export default new AuthController();