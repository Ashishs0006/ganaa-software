import express, { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';

const router = express.Router();

router.route('/').get(
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: 'success',
      message: 'Wellcome to Ganaa Backend',
    });
  })
);

export default router;
