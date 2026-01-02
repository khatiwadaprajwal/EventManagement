
export class ApiFeatures {
  query: any;
  queryString: any;

  constructor(query: any, queryString: any) {
    this.query = query; // The Prisma Query Object (e.g. { where: ... })
    this.queryString = queryString; // req.query (e.g. { page: '2', sort: 'date' })
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Basic filtering (e.g., location='Kathmandu')
    this.query.where = { ...this.query.where, ...queryObj };
    
    // Search Logic (Title or Description)
    if (this.queryString.search) {
      this.query.where = {
        ...this.query.where,
        OR: [
          { title: { contains: this.queryString.search, mode: 'insensitive' } },
          { description: { contains: this.queryString.search, mode: 'insensitive' } },
        ],
      };
    }

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      // Handle simple sorting for Prisma (e.g. "price" -> { price: 'asc' })
      // For simplicity, we assume single field sort like 'date' or '-date' (desc)
      const sortField = this.queryString.sort.replace('-', '');
      const order = this.queryString.sort.startsWith('-') ? 'desc' : 'asc';
      
      this.query.orderBy = { [sortField]: order };
    } else {
      this.query.orderBy = { createdAt: 'desc' }; // Default: Newest first
    }
    return this;
  }

  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 10;
    const skip = (page - 1) * limit;

    this.query.skip = skip;
    this.query.take = limit;

    return this;
  }
}