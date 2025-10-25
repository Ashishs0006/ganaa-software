declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /**
       * ENV
       */
      NODE_ENV: string;
      DATABASE_URL: string;
      /**
       * SERVER INFO
       */
      SERVER_IP: string;
      SERVER_PORT: string;
      SERVER_URL: string;
      /**
       * JWT
       */
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
      /**
       * CORS
       */
      CORS_ORIGIN: string;
      /**
       * AWS
       */
      AWS_ACCESS_KEY_ID: string;
      AWS_ACCESS_SECRET: string;
      AWS_REGION: string;
      AWS_BUCKET: string;
    }
  }
}

export {};
