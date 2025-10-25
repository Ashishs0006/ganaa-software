import { Request, Response, NextFunction } from 'express';

export default (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  let errMessage = err.message;

  console.log(err);

  if (err?.code == 'LIMIT_UNEXPECTED_FILE') {
    errMessage = 'File passed in unknown Field';
  }

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: errMessage,
  });

  return;
};
