import { FileFilterCallback } from 'multer';
import AppError from './appError';
import { UserRequest } from '../interfaces/extra/i_extended_class';

export class MFileFilter {
  // Utility function to check file validity
  private static isValidFile(file: Express.Multer.File, allowedMimeTypes: string[]): boolean {
    return allowedMimeTypes.some((mimeType) => file.mimetype.startsWith(mimeType));
  }

  // Main file filter builder function
  private static buildFileFilter({
    allowedMimeTypes,
    errorMessage,
  }: {
    allowedMimeTypes: string[];
    errorMessage: string;
  }) {
    return (req: UserRequest, file: Express.Multer.File, cb: FileFilterCallback) => {
      if (!req.user) return cb(new AppError('User is not authenticated', 401));

      if (MFileFilter.isValidFile(file, allowedMimeTypes)) {
        cb(null, true);
      } else {
        cb(new AppError(errorMessage, 400));
      }
    };
  }

  // For only images & pdf
  static imageAndPdfFilter = MFileFilter.buildFileFilter({
    allowedMimeTypes: ['image/', 'application/pdf'],
    errorMessage: 'Only Image or PDF files are supported',
  });

  // For only images
  static imageFilter = MFileFilter.buildFileFilter({
    allowedMimeTypes: ['image/'],
    errorMessage: 'Only Image files are supported',
  });

  // For only PDF files
  static pdfFilter = MFileFilter.buildFileFilter({
    allowedMimeTypes: ['application/pdf'],
    errorMessage: 'Only PDF files are supported',
  });
}
