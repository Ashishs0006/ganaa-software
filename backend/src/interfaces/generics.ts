export interface ValidationSchema {
  body?: object;
  query?: object;
  params?: object;
  validate: ({}) => Promise<any>;
}

export type arrayOfString = string[];

export interface IBasicObj {
  [key: string]: any;
}

export interface IResult<T> {
  data?: T;
  message?: string;
  isSuccess: boolean;
}

export interface IBasicFile {
  fileName: string;
  filePath: string;
}

export interface IBasicMulterFile {
  fieldName: string;
  orignalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}
