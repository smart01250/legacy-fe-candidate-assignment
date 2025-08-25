
export function isArray(arg) {
  return Array.isArray(arg);
}

export function isBoolean(arg) {
  return typeof arg === 'boolean';
}

export function isNull(arg) {
  return arg === null;
}

export function isNullOrUndefined(arg) {
  return arg === null || arg === undefined;
}

export function isNumber(arg) {
  return typeof arg === 'number';
}

export function isString(arg) {
  return typeof arg === 'string';
}

export function isSymbol(arg) {
  return typeof arg === 'symbol';
}

export function isUndefined(arg) {
  return arg === undefined;
}

export function isRegExp(arg) {
  return arg instanceof RegExp;
}

export function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

export function isDate(arg) {
  return arg instanceof Date;
}

export function isError(arg) {
  return arg instanceof Error;
}

export function isFunction(arg) {
  return typeof arg === 'function';
}

export function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||
         typeof arg === 'undefined';
}

export function isBuffer(arg) {
  return arg && typeof arg.constructor === 'function' && 
         arg.constructor.name === 'Buffer';
}

// Formatting functions
export function format(f, ...args) {
  if (typeof f !== 'string') {
    const objects = [f, ...args].map(arg => inspect(arg)).join(' ');
    return objects;
  }

  let i = 0;
  const str = String(f).replace(/%[sdj%]/g, (x) => {
    if (x === '%%') return x;
    if (i >= args.length) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });

  for (let arg = args[i]; i < args.length; arg = args[++i]) {
    if (isNull(arg) || (!isObject(arg) && !isFunction(arg))) {
      str += ' ' + arg;
    } else {
      str += ' ' + inspect(arg);
    }
  }

  return str;
}

export function inspect(obj, options = {}) {
  const opts = {
    showHidden: options.showHidden || false,
    depth: options.depth !== undefined ? options.depth : 2,
    colors: options.colors || false,
    customInspect: options.customInspect !== false,
    showProxy: options.showProxy || false,
    maxArrayLength: options.maxArrayLength || 100,
    maxStringLength: options.maxStringLength || Infinity,
    breakLength: options.breakLength || 60,
    compact: options.compact !== false,
    sorted: options.sorted || false,
    getters: options.getters || false
  };

  return formatValue(obj, opts, 0, new Set());
}

function formatValue(value, options, depth, seen) {
  // Handle primitives
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `'${value}'`;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'symbol') return value.toString();
  if (typeof value === 'function') return `[Function: ${value.name || 'anonymous'}]`;

  // Handle circular references
  if (seen.has(value)) return '[Circular]';
  
  // Check depth limit
  if (depth > options.depth) return '[Object]';

  seen.add(value);

  try {
    // Handle arrays
    if (Array.isArray(value)) {
      const items = value.slice(0, options.maxArrayLength).map(item => 
        formatValue(item, options, depth + 1, seen)
      );
      if (value.length > options.maxArrayLength) {
        items.push(`... ${value.length - options.maxArrayLength} more items`);
      }
      return `[ ${items.join(', ')} ]`;
    }

    // Handle dates
    if (value instanceof Date) {
      return value.toISOString();
    }

    // Handle errors
    if (value instanceof Error) {
      return `${value.name}: ${value.message}`;
    }

    // Handle regular expressions
    if (value instanceof RegExp) {
      return value.toString();
    }

    // Handle objects
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) return '{}';
      
      const items = keys.slice(0, 10).map(key => {
        const val = formatValue(value[key], options, depth + 1, seen);
        return `${key}: ${val}`;
      });
      
      if (keys.length > 10) {
        items.push(`... ${keys.length - 10} more properties`);
      }
      
      return `{ ${items.join(', ')} }`;
    }

    return String(value);
  } finally {
    seen.delete(value);
  }
}

// Deprecation function
export function deprecate(fn, msg, code) {
  let warned = false;
  
  function deprecated(...args) {
    if (!warned) {
      console.warn(`DeprecationWarning: ${msg}`);
      warned = true;
    }
    return fn.apply(this, args);
  }
  
  deprecated._deprecationWarning = msg;
  return deprecated;
}

// Promisify function
export function promisify(original) {
  if (typeof original !== 'function') {
    throw new TypeError('The "original" argument must be of type Function');
  }

  function promisified(...args) {
    return new Promise((resolve, reject) => {
      args.push((err, ...values) => {
        if (err) {
          reject(err);
        } else {
          resolve(values.length === 1 ? values[0] : values);
        }
      });
      
      try {
        original.apply(this, args);
      } catch (err) {
        reject(err);
      }
    });
  }

  Object.setPrototypeOf(promisified, Object.getPrototypeOf(original));
  Object.defineProperty(promisified, 'name', { value: original.name });
  return promisified;
}

// Callbackify function
export function callbackify(original) {
  if (typeof original !== 'function') {
    throw new TypeError('The "original" argument must be of type Function');
  }

  function callbackified(...args) {
    const callback = args.pop();
    if (typeof callback !== 'function') {
      throw new TypeError('The last argument must be of type Function');
    }

    const promise = original.apply(this, args);
    if (promise && typeof promise.then === 'function') {
      promise.then(
        (result) => callback(null, result),
        (error) => callback(error)
      );
    } else {
      callback(null, promise);
    }
  }

  Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original));
  Object.defineProperty(callbackified, 'name', { value: original.name });
  return callbackified;
}

// TextEncoder/TextDecoder (usually available in modern browsers)
export const TextEncoder = globalThis.TextEncoder || class {
  encode(input) {
    const bytes = [];
    for (let i = 0; i < input.length; i++) {
      const code = input.charCodeAt(i);
      if (code < 0x80) {
        bytes.push(code);
      } else if (code < 0x800) {
        bytes.push(0xc0 | (code >> 6));
        bytes.push(0x80 | (code & 0x3f));
      } else {
        bytes.push(0xe0 | (code >> 12));
        bytes.push(0x80 | ((code >> 6) & 0x3f));
        bytes.push(0x80 | (code & 0x3f));
      }
    }
    return new Uint8Array(bytes);
  }
};

export const TextDecoder = globalThis.TextDecoder || class {
  decode(input) {
    let result = '';
    for (let i = 0; i < input.length; i++) {
      result += String.fromCharCode(input[i]);
    }
    return result;
  }
};

// Default export
const util = {
  isArray,
  isBoolean,
  isNull,
  isNullOrUndefined,
  isNumber,
  isString,
  isSymbol,
  isUndefined,
  isRegExp,
  isObject,
  isDate,
  isError,
  isFunction,
  isPrimitive,
  isBuffer,
  format,
  inspect,
  deprecate,
  promisify,
  callbackify,
  TextEncoder,
  TextDecoder
};

export default util;
