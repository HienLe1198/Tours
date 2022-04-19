const Tour = require('../models/tourModel')

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  next();
};

exports.getAllTour = async (req,res) => {
  try{
    console.log(req)
    const queryObj = { ...req.query };
    const excludeFields = ['page','sort','limit', 'fields'];
    excludeFields.forEach(el => delete queryObj[el]);
    console.log(queryObj);

    // Advanced filtering
    const regex = /\b(gt|gte|lt|lte|in)\b/g;
    const queryStr = JSON.stringify(queryObj).replace(regex, match => `$${match}`);
    let query = Tour.find(JSON.parse(queryStr));
    // Sorting
    if(req.query.sort){
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    }
    else{
      query = query.sort('-createdAt');
    }
    // Fields
    if(req.query.fields){
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    }
    else{
      query = query.select('-__v');
    }
    //pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if(req.query.page){
      const numTours = await Tour.countDocuments();
      if(skip >= numTours) throw new Error("This page is not exist");
    }
    const tours = await query;
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  }
  catch(err){
    res.status(400).json({
      status: 'fail',
      message: err.errmsg
    });
  }
};
exports.getTour = async (req,res) => {
  try{
    const tour = await Tour.findById(req.params.id)
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  }
  catch(err){
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.createTour = async (req,res)=>{
  try{
    const newTour = await Tour.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  }
  catch(err){
    res.status(400).json({
      status: 'fail',
      message: err.errmsg
    });
  }
};

exports.updateTour = async (req,res) => {
  try{
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  }
  catch(err){
    res.status(400).json({
      status: 'fail',
      message: err.errmsg
    });
  }
};

exports.deleteTour = async (req,res) => {
  try{
    await Tour.findByIdAndDelete(req.params.id)
    res.status(204).json({
      status: 'success',
      data: null
    });
  }
  catch(err){
    res.status(400).json({
      status: 'fail',
      message: err.errmsg
    });
  }
};