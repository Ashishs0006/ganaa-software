interface String {
  isLengthZero(): boolean;
}

String.prototype.isLengthZero = function (): boolean {
  return this.length === 0;
};
