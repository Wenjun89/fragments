/**
 * For increased data privacy, we store only a hashed version of the user's email.
 * We use a sha256 hash of the user's email encoded in hex, which is safe to
 * include in URLs. For example:
 *
 *   6Xoj0UXOW3FNirlSYranli5gY6dDq60hs24EIAcHAEc=
 *
 * You can either use the whole thing, or truncate to only use the first 8
 * characters or so in order to reduce the length:
 *
 *   6Xoj0UXO
 *
 * Use .slice(0, 8) if you want reduce the size.
 */

const crypto = require('crypto');

/**
 * @param {string} email user's email address
 * @returns {string} Hashed email address (lowercase, trimmed, and hashed via sha256)
 */
module.exports = (email) => {
 
  const sanitizedEmail = email.trim().toLowerCase();

  return crypto.createHash('sha256').update(sanitizedEmail).digest('hex');
};
