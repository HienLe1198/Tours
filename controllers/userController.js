const User = require('../models/userModel')
const catchAsync = require("../utils/catchAsync")
const APIFeatures = require('../utils/apiFeatures')
const AppError = require('../utils/appError')

exports.getAllUser = catchAsync(async (req,res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(User.find(), req.query).filter().limitFields().paginate();
  const users = await features.query;
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
})
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
  if(!user){
    return next(new AppError('Not found user with this ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
})

exports.createUser = catchAsync(async (req,res,next)=>{
  const newUser = await User.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      user: newUser
    }
  });
})

exports.updateUser = catchAsync(async (req,res,next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
})

exports.deleteUser = catchAsync(async (req,res,next) => {
  await User.findByIdAndDelete(req.params.id)
  res.status(204).json({
    status: 'success',
    data: null
  });
})