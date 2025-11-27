import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// Ensure ENCRYPTION_KEY is 32 bytes (256 bits)
// In production, this must be set in .env
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "12345678901234567890123456789012"; // Fallback for dev only
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16

export function encrypt(text: string): string {
    if (!text) return text;

    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    // Format: IV:AuthTag:EncryptedData
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(text: string): string {
    if (!text) return text;

    // Check if text is in correct format (IV:AuthTag:Data)
    const parts = text.split(':');
    if (parts.length !== 3) {
        // Return original text if it doesn't look encrypted (backward compatibility)
        return text;
    }

    try {
        const [ivHex, authTagHex, encryptedHex] = parts;

        const decipher = createDecipheriv(
            ALGORITHM,
            Buffer.from(ENCRYPTION_KEY),
            Buffer.from(ivHex, 'hex')
        );

        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error("Decryption failed:", error);
        return text; // Return original on failure (fallback)
    }
}
