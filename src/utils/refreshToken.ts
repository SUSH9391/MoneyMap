import crypto from 'crypto';

/**
 * usually if we use supabase supabase has its own mechanism to create the access token and 
 * refresh token and its rule to mantain it but here since im doing in on my own from strach
 * 1 genetate a cryptrograpically opaque refresh token
 *  the caller of this refresh token recives both
 * - raw and hashed keys
 * - raw: sent to the client (stored in securestorge on mobile if this is used as a frontend app)
 *        if it is used as a website it is it is stored in the browsers localstorage 
 * - hashed: stored in the databse as (SHA- 256 of raw)
 * storing only the hash means a DB breach never exposes an usable token
 */
export const generateRefreshToken = () => {
    const raw = crypto.randomBytes(64).toString('hex') //this is a hex-dec value key
    const hashed = hashToken(raw); //we are just gonna hash the raw token
    return { raw, hashed };
}
export const hashToken = (raw: string) => { //defining the hashToken variable 
    return crypto.createHash('sha256').update(raw).digest('hex');
}
/**
 * calculation of the expiry date for the refresh token
 */
export const getRefreshTokenExpiry = (daysFromNow = 30): Date => {
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + daysFromNow);
    return expiry;
}