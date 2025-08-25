// Crypto polyfill for browser environment using Web Crypto API
import { Buffer } from './buffer.js';

// Use the browser's Web Crypto API when available
const webCrypto = globalThis.crypto || globalThis.msCrypto;

class Hash {
  constructor(algorithm) {
    this.algorithm = algorithm;
    this.data = new Uint8Array(0);
  }

  update(data) {
    if (typeof data === 'string') {
      data = new TextEncoder().encode(data);
    } else if (Buffer.isBuffer(data)) {
      data = new Uint8Array(data);
    }
    
    const newData = new Uint8Array(this.data.length + data.length);
    newData.set(this.data);
    newData.set(data, this.data.length);
    this.data = newData;
    
    return this;
  }

  digest(encoding) {
    let hash = 0;
    for (let i = 0; i < this.data.length; i++) {
      const char = this.data[i];
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    // Convert to bytes
    const bytes = new Uint8Array(4);
    bytes[0] = (hash >>> 24) & 0xFF;
    bytes[1] = (hash >>> 16) & 0xFF;
    bytes[2] = (hash >>> 8) & 0xFF;
    bytes[3] = hash & 0xFF;
    
    const result = new Buffer(bytes);
    
    if (encoding === 'hex') {
      return result.toString('hex');
    } else if (encoding === 'base64') {
      return result.toString('base64');
    } else {
      return result;
    }
  }
}

// Crypto functions
export function createHash(algorithm) {
  return new Hash(algorithm);
}

export function createHmac(algorithm, key) {
  // Simplified HMAC implementation
  const hash = new Hash(algorithm);
  if (typeof key === 'string') {
    key = new TextEncoder().encode(key);
  }
  hash.update(key);
  return hash;
}

export function randomBytes(size) {
  if (webCrypto && webCrypto.getRandomValues) {
    const bytes = new Uint8Array(size);
    webCrypto.getRandomValues(bytes);
    return new Buffer(bytes);
  } else {
    // Fallback for environments without Web Crypto API
    const bytes = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return new Buffer(bytes);
  }
}

export function randomFillSync(buffer, offset = 0, size = buffer.length) {
  const randomData = randomBytes(size);
  for (let i = 0; i < size; i++) {
    buffer[offset + i] = randomData[i];
  }
  return buffer;
}

export function pbkdf2Sync(password, salt, iterations, keylen, digest) {
  // Simplified PBKDF2 implementation
  // In a real implementation, you'd use Web Crypto API's PBKDF2
  const hash = createHash(digest || 'sha256');
  hash.update(password);
  hash.update(salt);
  
  let result = hash.digest();
  
  // Simulate iterations (simplified)
  for (let i = 1; i < iterations; i++) {
    const nextHash = createHash(digest || 'sha256');
    nextHash.update(result);
    result = nextHash.digest();
  }
  
  // Truncate or extend to desired length
  if (result.length > keylen) {
    return result.slice(0, keylen);
  } else if (result.length < keylen) {
    const extended = new Buffer(keylen);
    let offset = 0;
    while (offset < keylen) {
      const remaining = keylen - offset;
      const copyLength = Math.min(result.length, remaining);
      result.copy(extended, offset, 0, copyLength);
      offset += copyLength;
    }
    return extended;
  }
  
  return result;
}

export function scryptSync(password, salt, keylen, options = {}) {
  // Simplified scrypt implementation using PBKDF2 as fallback
  return pbkdf2Sync(password, salt, options.N || 16384, keylen, 'sha256');
}

// Constants
export const constants = {
  OPENSSL_VERSION_NUMBER: 0x1010100f,
  SSL_OP_ALL: 0x80000BFF,
  SSL_OP_NO_SSLv2: 0x0,
  SSL_OP_NO_SSLv3: 0x02000000,
  SSL_OP_NO_TLSv1: 0x04000000,
  SSL_OP_NO_TLSv1_1: 0x10000000,
  SSL_OP_NO_TLSv1_2: 0x08000000,
  SSL_OP_NO_TLSv1_3: 0x20000000,
  POINT_CONVERSION_COMPRESSED: 2,
  POINT_CONVERSION_UNCOMPRESSED: 4,
  POINT_CONVERSION_HYBRID: 6
};

// Default export
const crypto = {
  createHash,
  createHmac,
  randomBytes,
  randomFillSync,
  pbkdf2Sync,
  scryptSync,
  constants
};

export default crypto;
