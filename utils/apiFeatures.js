class APIFeatures{
  constructor(query, queryString){
    this.query = query;
    this.queryString = queryString;
  }

  filter(){
    const queryObj = { ...this.queryString };
    const excludeFields = ['page','sort','limit', 'fields'];
    excludeFields.forEach(el => delete queryObj[el]);

    // Advanced filtering
    const regex = /\b(gt|gte|lt|lte|in)\b/g;
    const queryStr = JSON.stringify(queryObj).replace(regex, match => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort(){
    // Sorting
    if(this.queryString.sort){
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }
    else{
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields(){
    // Fields
    if(this.queryString.fields){
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    else{
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate(){
    //pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    // if(this.queryString.page){
    //   const numTours = await Tour.countDocuments();
    //   if(skip >= numTours) throw new Error("This page is not exist");
    // }
    return this;
  }
}
module.exports = APIFeatures;