const mongoose = require("mongoose");

const connectDB = (url) => {
  return mongoose.connect(url);
};

module.exports = connectDB;

// old options. They removed with mongoose version 6
/*

const connectDB = (url) => {
  return mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
}

*/
