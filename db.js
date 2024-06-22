const mongoose = require('mongoose');


const connectToMongo = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/trendifymart', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('Connected to MongoDB successfuly');

  } catch (error) {
    console.log(`error connecting to MongoDB: ${error}`);
  }
}

module.exports = connectToMongo;