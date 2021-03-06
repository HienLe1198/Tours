const Tour = require('../models/tourModel')
const catchAsync = require("../utils/catchAsync")
const APIFeatures = require('../utils/apiFeatures')
const AppError = require('../utils/appError')

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  next();
};

exports.getAllTour = catchAsync(async (req,res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query).filter().limitFields().paginate();
  const tours = await features.query;
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
})
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id)
  if(!tour){
    return next(new AppError('Not found tour with this ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
})

exports.createTour = catchAsync(async (req,res,next)=>{
  const newTour = await Tour.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
})

exports.updateTour = catchAsync(async (req,res,next) => {
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
})

exports.deleteTour = catchAsync(async (req,res,next) => {
  await Tour.findByIdAndDelete(req.params.id)
  res.status(204).json({
    status: 'success',
    data: null
  });
})

exports.getTourStats = catchAsync(async (req,res,next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: {$gte: 3.0}}
    },
    {
      $group: {
        _id: { $toUpper : '$difficulty'},
        numTours: { $sum : 1 },
        numRating: { $sum : '$ratingsQuantity' },
        avgRating: { $avg : '$ratingsAverage' },
        avgPrice: { $avg : '$price' },
        minPrice: { $min : '$price' },
        maxPrice: { $max : '$price' }
      }
    },
    {
      $sort: {
        avgPrice : 1
      }
    },
    {
      $match : { _id : { $ne: 'EASY'}}
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
})

exports.getMonthlyPlan = catchAsync(async (req,res,next) => {
  const year = req.params.year;
  console.log(year);
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum : 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: { _id: 0 }
    },
    {
      $sort: { month: 1 }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
})