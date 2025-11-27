import crypto from 'crypto';

/**
 * Generate Gravatar URL from email
 * @param email User's email address
 * @param size Avatar size in pixels (default: 32)
 * @returns Gravatar URL
 */
export function getGravatarUrl(email: string, size: number = 32): string {
    const hash = crypto
        .createHash('md5')
        .update(email.toLowerCase().trim())
        .digest('hex');

    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}

/**
 * Get initials from name for fallback avatar
 * @param name User's name
 * @returns Initials (max 2 characters)
 */
export function getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}
