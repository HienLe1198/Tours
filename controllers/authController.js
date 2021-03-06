const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = id => jwt.sign({id}, process.env.JWT_SECRET,{
    expiresIn: process.env.JWT_EXPIRES_IN
  })
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  }
  if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions)
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
}

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach( el => {
    if(allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj;
}
exports.signUp = catchAsync(async (req,res,next)=>{
  const newUser = await User.create(req.body);
  createSendToken(newUser, 201, res);
})

exports.login = catchAsync(async (req,res,next)=>{
  const {email, password} = req.body;
  //check if email and password exist
  if(!email || !password){
    return next(new AppError("Please provide email and password", 400));
  }
  //Check if user exist and password correct
  const user = await User.findOne({email}).select('+password');
  const corect = user.correctPassword(password,user.password);

  if(!user || !corect){
    return next(new AppError("Invalid email and password", 400));
  }
  //If everthing ok send token to client
  createSendToken(user, 200, res);
})

exports.protect = catchAsync(async (req,res,next)=>{
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next()
})

exports.restrictTo = (...roles) => (req, res, next) => {
    if(!roles.includes(req.user.role)){
      return next(new AppError('You dont have permission to perform this action', 403));
    }
    next();
  }

exports.forgotPassword = async (req, res, next) => {
  // Get user based on posted email
  const user = await User.findOne({email: req.body.email});
  if(!user){
    return next(new AppError('There is no user with this email address', 404));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave : false });
  // send it to user email
  const resetURL = `${req.protocal}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

  const message = `Forgot your password? Submit the PATCH request with your new password and password confirm to: ${resetURL}.\n If you didn't forget please ignore this email`;
  try{
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',

    })
    res.status(200).json({
      status: 'success',
      message: 'Token send to email'
    })
  }
  catch(err){
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave : false });

    return next(new AppError(err, 500));
  }
}

exports.resetPassword = catchAsync( async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  // 2) If token has not expired and there is user, set the new password
  if(!user){
    return next(new AppError('Token is invalid or has expired', 400))
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) Update changePasswordAt prop for user

  // 4) Login user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync( async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  // 2) Check if posted current pass is correct
  if(!(await user.correctPassword(req.body.passwordCurent, user.password))){
    return next(new AppError('Your current password is wrong', 401));
  }
  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

exports.updateMe = catchAsync( async (req,res,next) => {
  // 1) Create error if user POSTS password data
  if(req.body.password || req.body.passwordConfirm){
    return next(new AppError('This route is not for update password. Please use /updateMyPassword.', 400));
  }
  // 2) Update user document
  const filterBody = filterObj(req.body, 'name', 'email');
  const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser
    }
  })
});

exports.deleteMe = catchAsync( async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id,{ active: false });

  res.status(204).json({
    status: 'success',
    data: null
  })
})