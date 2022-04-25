const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/appError');

const signToken = id => jwt.sign({id}, process.env.JWT_SECRET,{
    expiresIn: process.env.JWT_EXPIRES_IN
  })

exports.signUp = catchAsync(async (req,res,next)=>{
  const newUser = await User.create(req.body);

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
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
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
})

exports.protect = catchAsync(async (req,res,next)=>{
  const token = req.headers.authorization;
  next();
})