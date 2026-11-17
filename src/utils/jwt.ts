import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
export interface JwtPayload {
    userId: string,
    email: string
}
/**
 * sign a short lived access token (this jwt is short lived in 15mins)
 * this token is sent in authorization headers for every protected route
 */
export const signAccessToken = (payload: JwtPayload) => {
    if (!config.jwtSecret) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jwt.sign(payload,config.jwtSecret, {
        expiresIn: (config.jwtExpiresIn || '15m') as any,
    });
};
/**
 * verify the access token and decode the payload
 * throw if the token is invalid or expired
 */
export const verifyAccessToken = (token: string) => {
    if(!config.jwtSecret){
        throw new Error("JWT_SECRET is not defined")
    }
    try{
        const decoded = jwt.verify(token,config.jwtSecret) as JwtPayload;
        return decoded;
    }catch{
        throw new Error('Invalid or expired token');
    }
};

/**
 * 
 */
