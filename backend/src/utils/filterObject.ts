import { IBasicObj } from '../interfaces/generics';

class FilterObject {
  private obj: IBasicObj;

  constructor(obj: IBasicObj, ...allowedFields: string[]) {
    this.obj = {};

    Object.keys(obj).forEach((el) => {
      if (allowedFields.includes(el)) {
        this.obj[el] = obj[el];
      }
    });
  }

  parse(field: string, parser: (value: any) => any): this {
    if (this.obj[field]) {
      this.obj[field] = parser(this.obj[field]);
    }
    return this;
  }

  parseDate(...fields: string[]): this {
    fields.forEach((field) => this.parse(field, (value) => new Date(value)));
    return this;
  }

  get(): IBasicObj {
    return this.obj;
  }
}

function parseJsonObject(obj: IBasicObj, ...fieldToBeParsed: string[]): IBasicObj {
  const newObj: IBasicObj = {};

  Object.keys(obj).forEach((el) => {
    if (fieldToBeParsed.includes(el)) {
      newObj[el] = JSON.parse(obj[el]);
    } else {
      newObj[el] = obj[el];
    }
  });

  return newObj;
}

export { parseJsonObject };
export default FilterObject;
