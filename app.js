const { json } = require('express');
const express = require('express');

const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
// DECLARE ROUTE
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
// 1? MIDDLEWARE
if(process.env.NODE_ENV === 'development'){
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`))

// 2) HANDLE ROUTES

app.get('/', (req,res) => {
  res.status(200).json({message:"Hello from the server side!", app: "Natours"})
})

// 3) ROUTE
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`
  // })
  next(new AppError(`Can't find ${req.originalUrl} on this server!`,404));
})

app.use(globalErrorHandler);
// 4) START SERVER
module.exports = app;
