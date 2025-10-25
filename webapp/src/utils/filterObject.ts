/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
interface BasicObj {
  [key: string]: any;
}

class FilterObject {
  private obj: BasicObj;

  constructor(obj: BasicObj, ...allowedFields: string[]) {
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

  get(): BasicObj {
    return this.obj;
  }
}

export default FilterObject;
