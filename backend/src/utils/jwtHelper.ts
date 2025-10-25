import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import Env from '../constant/env';

export const createHash = async (value: string, salt: number = 12) => {
  return await bcrypt.hash(value, salt);
};

export const verifyHash = async (hash: string, originalString: string) => {
  return await bcrypt.compare(originalString, hash);
};

export const signToken = (id: string) => {
  return jwt.sign(
    { id } as object,
    Env.JWT_SECRET as string,
    {
      expiresIn: Env.JWT_EXPIRES_IN,
      issuer: Env.JWT_ISSUER_NAME,
    } as SignOptions
  );
};

export const jwtVerifyAsync = (token: string, key: string, options = {}) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, key, options, (error, payload) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(payload);
    });
  });
};
