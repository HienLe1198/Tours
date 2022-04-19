const { json } = require('express');
const express = require('express');

const app = express();
const morgan = require('morgan');
// DECLARE ROUTE
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

app.use('/api/v1/tours', tourRouter);
// 4) START SERVER
module.exports = app;