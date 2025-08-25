
import EventEmitter from './eventemitter3.js';

class Readable extends EventEmitter {
  constructor(options = {}) {
    super();
    this.readable = true;
    this.destroyed = false;
    this._readableState = {
      objectMode: options.objectMode || false,
      highWaterMark: options.highWaterMark || 16384,
      buffer: [],
      ended: false,
      reading: false
    };
  }

  _read(size) {

  }

  push(chunk) {
    if (chunk === null) {
      this._readableState.ended = true;
      this.emit('end');
      return false;
    }
    
    this._readableState.buffer.push(chunk);
    this.emit('data', chunk);
    return true;
  }

  read(size) {
    if (this._readableState.buffer.length === 0) {
      return null;
    }
    return this._readableState.buffer.shift();
  }

  pipe(destination) {
    this.on('data', (chunk) => {
      if (destination.write) {
        destination.write(chunk);
      }
    });
    
    this.on('end', () => {
      if (destination.end) {
        destination.end();
      }
    });
    
    return destination;
  }

  destroy() {
    this.destroyed = true;
    this.emit('close');
  }
}

class Writable extends EventEmitter {
  constructor(options = {}) {
    super();
    this.writable = true;
    this.destroyed = false;
    this._writableState = {
      objectMode: options.objectMode || false,
      highWaterMark: options.highWaterMark || 16384,
      buffer: [],
      ended: false
    };
  }

  _write(chunk, encoding, callback) {
    // Override in subclasses
    if (callback) callback();
  }

  write(chunk, encoding, callback) {
    if (typeof encoding === 'function') {
      callback = encoding;
      encoding = 'utf8';
    }
    
    this._write(chunk, encoding, callback);
    this.emit('drain');
    return true;
  }

  end(chunk, encoding, callback) {
    if (typeof chunk === 'function') {
      callback = chunk;
      chunk = null;
    } else if (typeof encoding === 'function') {
      callback = encoding;
      encoding = 'utf8';
    }
    
    if (chunk) {
      this.write(chunk, encoding);
    }
    
    this._writableState.ended = true;
    this.emit('finish');
    
    if (callback) callback();
  }

  destroy() {
    this.destroyed = true;
    this.emit('close');
  }
}

class Duplex extends Readable {
  constructor(options = {}) {
    super(options);
    this.writable = true;
    this._writableState = {
      objectMode: options.objectMode || false,
      highWaterMark: options.highWaterMark || 16384,
      buffer: [],
      ended: false
    };
  }

  _write(chunk, encoding, callback) {
    // Override in subclasses
    if (callback) callback();
  }

  write(chunk, encoding, callback) {
    if (typeof encoding === 'function') {
      callback = encoding;
      encoding = 'utf8';
    }
    
    this._write(chunk, encoding, callback);
    this.emit('drain');
    return true;
  }

  end(chunk, encoding, callback) {
    if (typeof chunk === 'function') {
      callback = chunk;
      chunk = null;
    } else if (typeof encoding === 'function') {
      callback = encoding;
      encoding = 'utf8';
    }
    
    if (chunk) {
      this.write(chunk, encoding);
    }
    
    this._writableState.ended = true;
    this.emit('finish');
    
    if (callback) callback();
  }
}

class Transform extends Duplex {
  constructor(options = {}) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    // Override in subclasses
    this.push(chunk);
    if (callback) callback();
  }

  _write(chunk, encoding, callback) {
    this._transform(chunk, encoding, callback);
  }
}

class PassThrough extends Transform {
  constructor(options = {}) {
    super(options);
  }
}

// Utility functions
export function pipeline(...streams) {
  const callback = typeof streams[streams.length - 1] === 'function' 
    ? streams.pop() 
    : () => {};
  
  for (let i = 0; i < streams.length - 1; i++) {
    streams[i].pipe(streams[i + 1]);
  }
  
  const lastStream = streams[streams.length - 1];
  lastStream.on('finish', callback);
  lastStream.on('error', callback);
  
  return lastStream;
}

export function finished(stream, callback) {
  const cleanup = () => {
    stream.removeListener('end', onEnd);
    stream.removeListener('finish', onFinish);
    stream.removeListener('error', onError);
    stream.removeListener('close', onClose);
  };
  
  const onEnd = () => {
    cleanup();
    callback();
  };
  
  const onFinish = () => {
    cleanup();
    callback();
  };
  
  const onError = (err) => {
    cleanup();
    callback(err);
  };
  
  const onClose = () => {
    cleanup();
    callback();
  };
  
  stream.on('end', onEnd);
  stream.on('finish', onFinish);
  stream.on('error', onError);
  stream.on('close', onClose);
}

// Exports
export { Readable, Writable, Duplex, Transform, PassThrough };

const stream = {
  Readable,
  Writable,
  Duplex,
  Transform,
  PassThrough,
  pipeline,
  finished
};

export default stream;
