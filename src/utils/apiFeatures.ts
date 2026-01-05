import { Model } from 'mongoose'

export class ApiFeatures<T> {
  model: Model<T>
  queryString: any
  defaultFilter: any
  populateOptions: any[]
  searchFields: string[]

  constructor(model: any, queryString: any, defaultFilter: any = {}) {
    this.model = model
    this.queryString = queryString
    this.defaultFilter = defaultFilter
    this.populateOptions = []
    this.searchFields = ['title', 'description']
  }

  search(fields: string[]) {
    this.searchFields = fields
    return this
  }

  populate(path: string, select?: string) {
    this.populateOptions.push({ path, select })
    return this
  }

  async execute() {
    const queryObj = { ...this.queryString }
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'startDate', 'endDate']
    excludedFields.forEach((el) => delete queryObj[el])

    Object.keys(queryObj).forEach((key) => {
      if (queryObj[key] === '' || queryObj[key] === null || queryObj[key] === undefined) {
        delete queryObj[key]
      }
    })

    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
    let finalQuery = JSON.parse(queryStr)

    if (
      this.queryString.search &&
      this.queryString.search.trim() !== '' &&
      this.searchFields.length > 0
    ) {
      const searchRegex = { $regex: this.queryString.search, $options: 'i' }
      const searchConditions = this.searchFields.map((field) => ({ [field]: searchRegex }))

      finalQuery = {
        ...finalQuery,
        $or: searchConditions,
      }
    }

    if (this.queryString.startDate || this.queryString.endDate) {
      finalQuery.createdAt = {}
      if (this.queryString.startDate && this.queryString.startDate !== '')
        finalQuery.createdAt.$gte = new Date(this.queryString.startDate)
      if (this.queryString.endDate && this.queryString.endDate !== '')
        finalQuery.createdAt.$lte = new Date(this.queryString.endDate)

      if (Object.keys(finalQuery.createdAt).length === 0) delete finalQuery.createdAt
    }

    const combinedQuery = {
      $and: [this.defaultFilter, finalQuery],
    }

    let sortStr = '-createdAt'
    if (this.queryString.sort && this.queryString.sort !== '') {
      sortStr = this.queryString.sort.split(',').join(' ')
    }

    const page = Math.max(1, parseInt(this.queryString.page || '1', 10))
    const limit = Math.max(1, parseInt(this.queryString.limit || '10', 10))
    const skip = (page - 1) * limit

    let fields = '-__v'
    if (this.queryString.fields && this.queryString.fields !== '') {
      fields = this.queryString.fields.split(',').join(' ')
    }

    // Explicitly casting query to any to handle type changes from chainable methods like populate
    let query: any = this.model
      .find(combinedQuery)
      .sort(sortStr)
      .skip(skip)
      .limit(limit)
      .select(fields)

    this.populateOptions.forEach((opt) => {
      query = query.populate(opt.path, opt.select)
    })

    const [totalItems, data] = await Promise.all([this.model.countDocuments(combinedQuery), query])

    const totalPages = Math.ceil(totalItems / limit)

    return {
      data,
      pageInfo: {
        currentPage: page,
        totalPages,
        totalItems,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    }
  }
}
