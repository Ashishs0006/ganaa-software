/**
 * Random class for generating random numbers and strings.
 * Based on the Python random module.
 *
 * @remarks
 * This class provides methods for generating random numbers, integers within a range,
 * choosing random elements from an array, shuffling arrays, and generating random strings.
 *
 * @example
 * const random = new Random();
 * console.log(random.random()); // Random float between 0 and 1
 * console.log(random.randint(1, 10)); // Random integer between 1 and 10
 * console.log(random.choice(["apple", "banana", "orange"])); // Random element from the array
 * console.log(random.shuffle([1, 2, 3, 4, 5])); // Shuffled array
 * console.log(random.randomUppercase(5)); // Random uppercase string of length 5
 * console.log(random.randomLowercase(5)); // Random lowercase string of length 5
 * console.log(random.randomMixedCase(5)); // Random mixed-case string of length 5
 * console.log(random.randomAlphaNumeric(8)); // Random alphanumeric string of length 8
 *
 * @license
 * MIT License
 *
 * @author Suraj Verma (gadgetvala)
 */

class Random {
  private seed: number;

  /**
   * Initializes a new instance of the Random class.
   *
   * @param seed - Optional. Seed value for initializing the random number generator.
   * If not provided, a random seed will be generated.
   */
  constructor(seed?: number) {
    if (seed) {
      this.seed = seed % 2147483647;
      if (this.seed <= 0) this.seed += 2147483646;
    } else {
      this.seed = Math.floor(Math.random() * 2147483647);
    }
  }

  /**
   * Generates the next pseudo-random number in the sequence.
   *
   * @returns A pseudo-random number between 1 and 2147483646.
   *
   * @internal
   */
  private next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed;
  }

  /**
   * Generates a pseudo-random float between 0 and 1 (exclusive).
   *
   * @returns A random float between 0 and 1.
   */
  random(): number {
    return (this.next() - 1) / 2147483646;
  }

  /**
   * Generates a pseudo-random integer within the specified range.
   *
   * @param min - The minimum value of the range (inclusive).
   * @param max - The maximum value of the range (inclusive).
   * @returns A random integer between min and max.
   */
  randint(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1) + min);
  }

  /**
   * Chooses a random element from the given array.
   *
   * @param arr - An array from which to choose a random element.
   * @returns A randomly selected element from the array.
   */
  choice<T>(arr: T[]): T {
    return arr[this.randint(0, arr.length - 1)];
  }

  /**
   * Shuffles the elements of the given array in-place.
   *
   * @param arr - An array to be shuffled.
   * @returns The shuffled array.
   */
  shuffle<T>(arr: T[]): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.randint(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Generates a random integer or an array of random integers between a specified range.
   *
   * @param min - The minimum value of the random integer (inclusive).
   * @param max - The maximum value of the random integer (inclusive).
   * @param length - (Optional) The number of random integers to generate. Defaults to 1.
   * @returns A single random integer or an array of random integers of the specified length.
   */
  randomInteger(min: number, max: number, length?: number): number | number[] {
    const generateRandom = () => Math.floor(Math.random() * (max - min + 1)) + min;

    if (length === undefined) {
      return generateRandom();
    }

    const result = [];
    for (let i = 0; i < length; i++) {
      result.push(generateRandom());
    }
    return result;
  }

  /**
   * Generates a random string consisting of uppercase letters.
   *
   * @param length - The length of the random string to generate.
   * @returns A random string of uppercase letters.
   */
  randomUppercase(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += String.fromCharCode(this.randint(65, 90));
    }
    return result;
  }

  /**
   * Generates a random string consisting of lowercase letters.
   *
   * @param length - The length of the random string to generate.
   * @returns A random string of lowercase letters.
   */
  randomLowercase(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += String.fromCharCode(this.randint(97, 122));
    }
    return result;
  }

  /**
   * Generates a random string consisting of mixed-case letters.
   *
   * @param length - The length of the random string to generate.
   * @returns A random string of mixed-case letters.
   */
  randomMixedCase(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += this.choice([this.randomUppercase(1), this.randomLowercase(1)]);
    }
    return result;
  }

  /**
   * Generates a random alphanumeric string.
   *
   * @param length - The length of the random string to generate.
   * @returns A random alphanumeric string.
   */
  randomAlphaNumeric(length: number): string {
    const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += this.choice(alphanumeric.split(''));
    }
    return result;
  }
}

const random = new Random();

export { random };
export default Random;
