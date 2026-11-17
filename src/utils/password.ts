//this is a pure helper function that is going to compare the password and provide hashing
import bcrypt from 'bcryptjs';
const SALT_ROUNDS = 10; // somewhat a seed value this is set to 10
export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
};
export const comparePassword = async (
    password: string,
    hashedPassword: string,

): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
}