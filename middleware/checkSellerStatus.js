// import the Seller schema to use it to find the seller document
const Seller = require('../models/Seller')

const checkSellerStatus = async (req, res, next) => {
  // initialize a boolean to determine whether the operation was successful or not
  let success = false;

  // a try and catch block is a recommended way of using as it helps with debugging
  try {

    // this variable will hold the id of the user trying to access whatever feature this middleware is called
    const userId = req.user.id;
    // using that user id we will get the user document from our database
    const user = await Seller.findOne({ _id: userId });
    // if we didn't find any document with that id we will return a bad request
    if (!user) {
      return res.json({ success, error: 'You are not elligible to access the feature' })
    }
    // if the user trying to access doesn't has seller boolean to be true in their document from DB we won't let the user access and throw a bad request
    if (!user.seller) {
      return res.status(400).json({ success, error: 'Not allowed' });
    }

    // 'next' function will cause the next middleware to run if present 
    next();
  } catch (error) {
    // throw error if anything in the try block gets wrong and log it in the console
    console.log(error);
    return res.status(400).json({ success, error: 'Internal Server error occured!' });
  }
}

module.exports = checkSellerStatus