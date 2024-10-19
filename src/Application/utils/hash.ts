// Write hash function to hash password
import crypto from 'crypto';

export function hash(password: string, salt: string): string {
    const hash = crypto.createHmac('sha256', salt);
    hash.update(password);
    return hash.digest('hex');
}

export function generateSalt(): string {
    return crypto.randomBytes(16).toString('hex');
}

export function checkHash(password: string, salt: string, hashed: string): boolean {
    return hash(password, salt) === hashed;
}
