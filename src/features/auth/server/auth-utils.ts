// This file contains server-only code
import './server-only';

// Import bcrypt dynamically to prevent client-side bundling
let bcrypt: any = null;

// Initialize bcrypt only on the server side
if (typeof window === 'undefined') {
  bcrypt = require('bcrypt');
}

// Server-side only functions for password hashing and comparison
export async function hashPassword(password: string): Promise<string> {
  if (!bcrypt) {
    throw new Error('bcrypt is not available (this should only happen on the client side)');
  }
  return bcrypt.hash(password, 10);
}

export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  if (!bcrypt) {
    throw new Error('bcrypt is not available (this should only happen on the client side)');
  }
  return bcrypt.compare(plainPassword, hashedPassword);
}
