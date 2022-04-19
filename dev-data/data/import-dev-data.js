const fs = require('fs');

const mongoose = require('mongoose');

const dotenv = require('dotenv');

const Tour = require('../../models/tourModel')

dotenv.config({path: './config.env'});

const DB = process.env.DATABASE.replace('<password>',process.env.DATABASE_PASSWORD);

mongoose.connect(DB,{
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(() => console.log("DB connection successful!"));

//READ Json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

// IMPORT DATA TO DB
const importData = async () => {
  try{
    await Tour.create(tours);
    console.log("Create tour successfully!");
  }
  catch(err){
    console.log(err);
  }
  process.exit();
}

// DELETE DATA
const deleteData = async () => {
  try{
    await Tour.deleteMany();
    console.log("Delete tours successfully!");
  }
  catch(err){
    console.log(err);
  }
  process.exit();
}

if(process.argv[2] === '--import'){
  importData();
}
else if(process.argv[2] === '--delete'){
  deleteData();
}