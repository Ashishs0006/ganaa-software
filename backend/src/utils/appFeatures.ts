import { FilterQuery, Query } from 'mongoose';
import { IBasicObj } from '../interfaces/generics';

export class PaginationInfo {
  static async exec<T>(
    queryModel: Query<number, T>,
    queryString: IBasicObj,
    rawQuery: FilterQuery<unknown>
  ) {
    const { page = 1, limit = 100 } = queryString;

    const totalDocuments = await queryModel.countDocuments(rawQuery);

    return {
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalDocuments / Number(limit)),
      totalDocuments,
    };
  }
}

class APIFeatures<T> {
  constructor(
    public query: Query<T[], T>,
    public queryString: IBasicObj
  ) {}

  /**
   * Applies filtering based on queryString, excluding any specified fields.
   *
   * NOTE: When using `.dateRangeFilter()`, make sure to exclude date keys (e.g., 'createdAt[gte]', 'createdAt[lte]')
   * from the filter call to prevent them from being parsed into standard filters.
   *
   * Example:
   *   const features = new APIFeatures(Model.find(), req.query)
   *     .filter('createdAt[gte]', 'createdAt[lte]')
   *     .dateRangeFilter('createdAt');
   */
  filter(...excludedFields: string[]) {
    let { page, sort, limit, fields, term, searchField, ...filters } = this.queryString;

    for (const field of excludedFields) {
      if (filters.hasOwnProperty(field)) delete filters[field];
    }

    this.query = this.query.find(this.parseQueryFilters(filters));

    return this;
  }

  search(...excludedFields: string[]) {
    if (!this.queryString.term || !this.queryString.searchField) return this;

    const allowedFields = this.queryString.searchField
      .split(',')
      .filter((field: string) => !excludedFields.includes(field));

    if (allowedFields.length) {
      let searchCondition: any;

      if (allowedFields.length === 1) {
        searchCondition = { [allowedFields[0]]: { $regex: this.queryString.term, $options: 'i' } };
      } else {
        searchCondition = {
          $or: allowedFields.map((field: string) => ({
            [field]: { $regex: this.queryString.term, $options: 'i' },
          })),
        };
      }

      this.query = this.query.find(searchCondition);
    }

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      this.query = this.query.sort(this.queryString.sort.split(',').join(' '));
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      this.query = this.query.select(this.queryString.fields.split(',').join(' '));
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  /**
   * Adds date range conditions to the query for specified fields.
   *
   * Supports keys like `createdAt[gte]` and `createdAt[lte]` in the query string.
   *
   * Make sure to remove these date keys from `.filter()` by passing them as excludedFields
   * to avoid them being parsed as standard filters.
   *
   * Example usage:
   *   const features = new APIFeatures(Model.find(), req.query)
   *     .filter('createdAt[gte]', 'createdAt[lte]')
   *     .dateRangeFilter('createdAt');
   */
  dateRangeFilter(...fields: string[]) {
    const dateFilters: any = {};

    for (const field of fields) {
      const gte = this.queryString[`${field}[gte]`];
      const lte = this.queryString[`${field}[lte]`];

      if (gte || lte) {
        dateFilters[field] = {};

        if (gte) dateFilters[field]['$gte'] = new Date(gte);
        if (lte) dateFilters[field]['$lte'] = new Date(lte);
      }
    }

    if (Object.keys(dateFilters).length > 0) {
      this.query = this.query.find(dateFilters);
    }

    return this;
  }

  rawQuery() {
    return this.query.getFilter();
  }

  private parseQueryFilters(filters: IBasicObj): IBasicObj {
    const queryStr = JSON.stringify(filters).replace(
      /\b(gte|gt|lte|lt|in)\b/g,
      (match) => `$${match}`
    );
    return JSON.parse(queryStr);
  }
}

export default APIFeatures;
