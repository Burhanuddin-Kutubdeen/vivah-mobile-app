// src/polyfills.ts
// Polyfill for increasing EventEmitter max listeners in browser environment
if (typeof window !== 'undefined' && (window as any).EventEmitter) {
  // For browser environments where EventEmitter is available
  const win = window as any;
  win.EventEmitter.prototype.setMaxListeners = function setMaxListeners(this: any, n: number) {
    this._maxListeners = n;
    return this;
  };

  // Set default max listeners for any new EventEmitters
  win.EventEmitter.defaultMaxListeners = 20;
} else if (typeof process !== 'undefined' && process && process.emitWarning) {
  // For Node.js environments
  const EventEmitter = require('events');
  EventEmitter.defaultMaxListeners = 20;
}