export default class Env {
  // ENV
  static NODE_ENV = process.env.NODE_ENV;
  static DATABASE_URL = process.env.DATABASE_URL;
  static DEFAULT_OTP = process.env.DEFAULT_OTP;

  // SERVER INFO
  static SERVER_IP = process.env.SERVER_IP;
  static SERVER_PORT = process.env.SERVER_PORT;
  static SERVER_URL = process.env.SERVER_URL;
  static PREFIX_TERM = process.env.PREFIX_TERM ?? '';

  // JWT
  static JWT_SECRET = process.env.JWT_SECRET;
  static JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
  static JWT_ISSUER_NAME = process.env.JWT_ISSUER_NAME;
  static DEFAULT_USER_PASSWORD = process.env.DEFAULT_USER_PASSWORD;

  // CORS ORIGN
  static CORS_ORIGIN = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : undefined;

  // AWS
  static AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
  static AWS_ACCESS_SECRET = process.env.AWS_ACCESS_SECRET;
  static AWS_REGION = process.env.AWS_REGION;
  static AWS_BUCKET = process.env.AWS_BUCKET;

  // Helper Methods
  static isExist(value: string | undefined | number | string[]): boolean {
    return value === null || value === undefined || value === '' ? false : true;
  }

  static validateEnv() {
    // ENV
    if (!Env.isExist(Env.NODE_ENV)) return 'Node ENV is mandatory';
    if (!Env.isExist(Env.DATABASE_URL)) return 'Database URL is mandatory';

    // SERVER INFO
    if (!Env.isExist(Env.JWT_SECRET)) return 'JWT Secret is mandatory';
    if (!Env.isExist(Env.JWT_EXPIRES_IN)) return 'JWT Expire Time is mandatory';
    if (!Env.isExist(Env.JWT_ISSUER_NAME)) return 'JWT Issuer Name is mandatory';
    if (!Env.isExist(Env.DEFAULT_USER_PASSWORD)) return 'Reset Password is mandatory';

    // CORS
    if (!Env.isExist(Env.CORS_ORIGIN)) return 'CORS Origin is mandatory';

    // AWS
    if (!Env.isExist(Env.AWS_ACCESS_KEY_ID)) return 'AWS Access Key ID is mandatory';
    if (!Env.isExist(Env.AWS_ACCESS_SECRET)) return 'AWS Access Secret is mandatory';
    if (!Env.isExist(Env.AWS_REGION)) return 'AWS Region is mandatory';
    if (!Env.isExist(Env.AWS_BUCKET)) return 'AWS Bucket is mandatory';

    return null;
  }

  static parseBool(value: string | undefined): boolean {
    if (value === null || value === undefined) return false;
    if (value.toLowerCase() === 'false') return false;
    return true;
  }

  static parseNumber(key: string | undefined): number {
    if (key === null || key === undefined) return 1;
    const value = process.env[key];
    if (value === null || value === undefined) return 1;
    if (value.toLowerCase() === 'false') return 1;
    return Number.parseInt(value);
  }
}
