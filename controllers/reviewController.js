const Review = require('../models/reviewModel')
const catchAsync = require("../utils/catchAsync")
const APIFeatures = require('../utils/apiFeatures')
const AppError = require('../utils/appError')

exports.getAllReview = catchAsync(async (req,res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Review.find(), req.query).filter().limitFields().paginate();
  const reviews = await features.query;
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
})
exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
  if(!review){
    return next(new AppError('Not found review with this ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
})

exports.createReview = catchAsync(async (req,res,next)=>{
  const newReview = await Review.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      review: newReview
    }
  });
})

exports.updateReview = catchAsync(async (req,res,next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
})

exports.deleteReview = catchAsync(async (req,res,next) => {
  await Review.findByIdAndDelete(req.params.id)
  res.status(204).json({
    status: 'success',
    data: null
  });
})