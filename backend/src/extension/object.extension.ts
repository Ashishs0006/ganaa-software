export {};

declare global {
  interface Object {
    toLowerCaseKeys(): Record<string, any>;
  }
}

Object.defineProperty(Object.prototype, 'toLowerCaseKeys', {
  value: function (): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        result[key.toLowerCase()] = this[key];
      }
    }
    return result;
  },
  enumerable: false, // don't pollute loops
});
