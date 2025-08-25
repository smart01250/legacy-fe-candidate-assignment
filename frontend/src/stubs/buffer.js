
class Buffer extends Uint8Array {
  constructor(arg, encodingOrOffset) {
    if (typeof arg === 'number') {
      super(arg);
    } else if (typeof arg === 'string') {
      const encoding = encodingOrOffset || 'utf8';
      if (encoding === 'hex') {
        const bytes = [];
        for (let i = 0; i < arg.length; i += 2) {
          bytes.push(parseInt(arg.substring(i, i + 2), 16));
        }
        super(bytes);
      } else if (encoding === 'base64') {
        const binaryString = atob(arg);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        super(bytes);
      } else {
        // Default to UTF-8
        const encoder = new TextEncoder();
        const bytes = encoder.encode(arg);
        super(bytes);
      }
    } else if (arg instanceof ArrayBuffer || arg instanceof Uint8Array) {
      super(arg);
    } else if (Array.isArray(arg)) {
      super(arg);
    } else {
      super(0);
    }
  }

  static from(arg, encoding) {
    return new Buffer(arg, encoding);
  }

  static alloc(size, fill = 0) {
    const buf = new Buffer(size);
    buf.fill(fill);
    return buf;
  }

  static allocUnsafe(size) {
    return new Buffer(size);
  }

  static isBuffer(obj) {
    return obj instanceof Buffer;
  }

  static concat(list, totalLength) {
    if (!Array.isArray(list)) {
      throw new TypeError('list must be an array');
    }
    
    if (totalLength === undefined) {
      totalLength = list.reduce((acc, buf) => acc + buf.length, 0);
    }
    
    const result = new Buffer(totalLength);
    let offset = 0;
    
    for (const buf of list) {
      result.set(buf, offset);
      offset += buf.length;
    }
    
    return result;
  }

  toString(encoding = 'utf8', start = 0, end = this.length) {
    const slice = this.slice(start, end);
    
    if (encoding === 'hex') {
      return Array.from(slice)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } else if (encoding === 'base64') {
      const binaryString = String.fromCharCode(...slice);
      return btoa(binaryString);
    } else {
      // Default to UTF-8
      const decoder = new TextDecoder();
      return decoder.decode(slice);
    }
  }

  toJSON() {
    return {
      type: 'Buffer',
      data: Array.from(this)
    };
  }

  equals(other) {
    if (!Buffer.isBuffer(other)) return false;
    if (this.length !== other.length) return false;
    
    for (let i = 0; i < this.length; i++) {
      if (this[i] !== other[i]) return false;
    }
    
    return true;
  }

  compare(other) {
    if (!Buffer.isBuffer(other)) {
      throw new TypeError('Argument must be a Buffer');
    }
    
    const minLength = Math.min(this.length, other.length);
    
    for (let i = 0; i < minLength; i++) {
      if (this[i] < other[i]) return -1;
      if (this[i] > other[i]) return 1;
    }
    
    if (this.length < other.length) return -1;
    if (this.length > other.length) return 1;
    return 0;
  }

  copy(target, targetStart = 0, sourceStart = 0, sourceEnd = this.length) {
    const source = this.slice(sourceStart, sourceEnd);
    target.set(source, targetStart);
    return source.length;
  }

  slice(start = 0, end = this.length) {
    const result = super.slice(start, end);
    return new Buffer(result);
  }

  write(string, offset = 0, length = this.length - offset, encoding = 'utf8') {
    const buf = new Buffer(string, encoding);
    const bytesToWrite = Math.min(length, buf.length, this.length - offset);
    
    for (let i = 0; i < bytesToWrite; i++) {
      this[offset + i] = buf[i];
    }
    
    return bytesToWrite;
  }

  fill(value, offset = 0, end = this.length) {
    if (typeof value === 'string') {
      value = value.charCodeAt(0);
    }
    
    for (let i = offset; i < end; i++) {
      this[i] = value;
    }
    
    return this;
  }
}

// Export both named and default exports
export { Buffer };
export default Buffer;

// Also export common buffer utilities
export const INSPECT_MAX_BYTES = 50;
export const kMaxLength = 0x7fffffff;
export const constants = {
  MAX_LENGTH: kMaxLength,
  MAX_STRING_LENGTH: 0x3fffffff
};
