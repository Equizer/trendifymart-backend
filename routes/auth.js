const express = require('express')
const router = express.Router();
const User = require('../models/User');
const Seller = require('../models/Seller')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser')
require('dotenv').config({ path: './backend/.env' });
const secretKey = process.env.JWT_SECRET;


// Route 1: Create a user - POST '/api/auth/signup' no seller / buyer login required  | not for seller

router.post('/signup', [
  body('name', 'Name must contain atleast 4 characters').isLength({ min: 4 }),
  body('email', 'Invalid Email').isEmail(),
  body('password', 'Password must contain atleast 6 characters').isLength({ min: 6 }),
  body('gender', 'Enter your gender').notEmpty(),
  body('dob', 'Enter your Date of Birth').notEmpty()
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }
  try {
    let user = await User.findOne({ email: req.body.email });

    if (user) {
      return res.status(400).json({ success, message: 'A user with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const securedPassword = await bcrypt.hash(req.body.password, salt);

    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: securedPassword,
      gender: req.body.gender,
      dob: req.body.dob,
      dateJoined: req.body.dateJoined
    });

    // we could simply do this like const data = user._id but we do this nesting so that in future if we want to send some more data as payload in authToken so that we can use them in our frontend it will be more easy
    //we can add a field in here that has a name role and that will determine whether the user is a buyer or a seller then in the frontend we can decide whether to let the user access some features like adding a product to the application should be allowed to only a seller not a buyer
    const data = {
      user: {
        id: user._id
      }
    }
    const authToken = jwt.sign(data, secretKey);

    success = true;

    return res.json({ success, message: "User Registered!", authToken });

  } catch (error) {
    console.error("Error", error)
    return res.status(500).json({ error: 'Interval error occured!' })
  }
});

// ROUTE 2: Log in - POST: 'api/auth/login no seller / buyer login required  | not for seller

router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'password cannot be empty').notEmpty()
], async (req, res) => {

  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, error: errors.array() });
  }

  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ success, error: 'User not found' });
    }
    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      return res.status(400).json({ success, error: 'Invalid password' });
    }

    const data = {
      user: {
        id: user._id
      }
    }

    const authToken = jwt.sign(data, secretKey);

    success = true;

    return res.json({ success, message: "Logged In", authToken });

  } catch (error) {
    console.error("Error", error)
    return res.status(500).json({ success, error: 'Interval error occured!' })
  }
});

// ROUTE 3: get user details: GET 'api/auth/getuserdetails'  buyer login required  | not for seller

router.get('/getuserdetails', fetchuser, async (req, res) => {

  let success = false;
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ success, error: 'No user ID found' })
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(400).json({ success, error: 'User not found!' });
    }
    success = true;

    return res.json({ success, user });
  } catch (error) {
    console.error("Error", error)
    return res.status(500).json({ success, error: 'Interval error occured!' })
  }
});

//ROUTE 4: Delete user: DELETE 'api/auth/deleteuser'  buyer login required | not for seller

router.delete('/deleteuser', fetchuser, async (req, res) => {
  let success = false;

  try {
    const userId = req.user.id;

    let userToDelete = await User.findById(userId);

    if (!userToDelete) {
      return res.status(400).json({ success, error: 'User not found' });
    }
    success = true;
    userToDelete = await User.findByIdAndDelete(userId);

    return res.json({ success, message: 'User Deleted', deletedUser: userToDelete });

  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ success, error: 'Interval server error occured' });
  }
});


// ROUTE 5: Seller Sign up : POST 'api/auth/sellersignup' no seller / buyer log in required  | not for bouyer

router.post('/sellersignup', [
  body('firstName', 'First name must contain ateast 2 characters').isLength({ min: 2 }),
  body('lastName', 'Last name must contain ateast 2 characters').isLength({ min: 2 }),
  body('shopName', 'Shop name must contain ateast 2 characters ').isLength({ min: 2 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password must contain ateast 6 characters').isLength({ min: 6 }),
  body('type', 'Enter your type of business').notEmpty(),
  body('state', 'Enter your state').notEmpty(),
  body('contactNumber', 'Contact Number must be atleast 5 numbers').isLength({ min: 5 })
], async (req, res) => {
  let success = false;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, error: errors.array() });
    }
    const { firstName, lastName, shopName, email, password, type, state, contactNumber, dateJoined } = req.body;

    let seller = await Seller.findOne({ email: email });
    if (seller) {
      return res.status(400).json({ success, error: 'A user with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    seller = await Seller.create({
      firstName: firstName,
      lastName: lastName,
      shopName: shopName,
      email: email,
      password: hashedPassword,
      type: type,
      state: state,
      contactNumber: contactNumber,
      dateJoined: dateJoined
    });

    const data = {
      user: {
        id: seller._id
      }
    };
    const authToken = jwt.sign(data, secretKey);
    success = true;
    return res.json({ success, authToken, message: 'Seller registered!' });


  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ success, error: 'Interval server error occured' });
  }
});


// ROUTE 6: Seller Login : POST: 'api/auth/sellerlogin' no seller / buyer login required   | not for bouyer


router.post('/sellerlogin', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Enter your password').notEmpty()
], async (req, res) => {
  let success = false;
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success, error: errors.array() })
    }
    const { email, password } = req.body;

    const seller = await Seller.findOne({ email });

    if (!seller) {
      return res.json({ success, error: 'Seller not found' });
    }
    const comparePassword = await bcrypt.compare(password, seller.password);

    if (!comparePassword) {
      return res.status(400).json({ success, error: 'Invalid email or password' });
    }
    const data = {
      user: {
        id: seller._id
      }
    }
    const authToken = jwt.sign(data, secretKey);

    success = true;

    return res.json({ success, message: 'Logged in Successfuly', authToken });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ success, error: 'Interval server error occured' });
  }

});

// ROUTE 7: Fetch Seller Details : GET 'api/auth/fetchsellerdetails' Seller login required | not for bouyer

router.get('/fetchsellerdetails', fetchuser, async (req, res) => {
  let success = false;
  try {
    const user = await Seller.findById(req.user.id, '-password');

    if (!user) {
      return res.status(400).json({ success, error: 'Seller not found' });
    }
    success = true;
    return res.json({ success, message: 'Details Fetched', user })
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ success, error: 'Interval server error occured' });
  }
});

// ROUTE 8: Delete a seller account : DELETE: 'api/auth/deleteseller' Seller login required | not for bouyer

router.delete('/deleteseller', fetchuser, async (req, res) => {
  let success = false;
  try {
    const userId = req.user.id;

    let seller = await Seller.findById(userId);
    if (!seller) {
      return res.status(400).json({ success, error: 'Seller not found!' });
    }

    seller = await Seller.findByIdAndDelete(userId);
    success = true;

    return res.json({ success, message: 'Seller Account Deleted!', deletedSeller: seller });

  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ success, error: 'Interval server error occured' });
  }

});


module.exports = router;