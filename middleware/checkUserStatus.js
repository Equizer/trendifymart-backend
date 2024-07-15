// import the Seller schema to use it to find the seller document
const Seller = require('../models/Seller')

const checkUserStatus = async (req, res, next) => {
  // initialize a boolean to determine whether the operation was successful or not
  let success = false;


  // a try and catch block is a recommended way of using as it helps with debugging
  try {

    // this variable will hold the id of the user trying to access whatever feature this middleware is called
    const userId = req.user.id;
    // using that user id we will get the user document from our database
    const user = await Seller.findOne({ _id: userId });
    user ? req.user.seller = true : req.user.seller = false;

    // 'next' function will cause the next middleware to run if present 
    next();
  } catch (error) {
    // throw error if anything in the try block gets wrong and log it in the console
    console.log(error);
    return res.status(400).json({ success, error: 'Internal Server error occured!' });
  }
}

module.exports = checkUserStatus