const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const checkSellerStatus = require('../middleware/checkSellerStatus');
const Product = require('../models/Product');
const BookmarkedItem = require('../models/BookmarkedItem')
const CartItem = require('../models/CartItem');
const { body, validationResult } = require('express-validator');


// ROUTE 1: Fetch all the products: GET: /api/products/fetchallproducts' no seller / buyer login required 

router.get('/fetchallproducts', async (req, res) => {
  let success = false;
  try {
    const allProducts = await Product.find();
    success = true;
    return res.json({ success, allProducts});
  } catch (error) {
    console.log('Errors: ', error);
    return res.status(500).json({ success, message: 'Internal server error occured', error });
  }
});

// ROUTE 2: Add a product: POST : '/api/products/addproduct'  buyer login required ([ seller only ] [ not for buyers ])
router.post('/addproduct', [
  body('imageUrl', 'Enter an image URL').notEmpty(),
  body('name', 'Product name must be atleast 5 character').isLength({ min: 5 }),
  body('description', 'Enter Product Description').notEmpty(),
  body('condition', 'Choose the condtion of your product').notEmpty(),
  body('priceCents', 'Enter a price for your product').notEmpty(),
  body('keywords', 'Enter some keywords for your product').notEmpty()
], fetchuser, checkSellerStatus, async (req, res) => {
  let success = false;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ success, error: errors.array() });
  }

  try {
    const { imageUrl, name, description, priceCents, keywords, condition, inStock } = req.body;

    const sellerId = req.user.id;

    if (!req.user.id) {
      return res.status(400).json({ success, error: 'Not allowed' });
    }

    if (!req.body.priceCents) {
      return res.status(400).json({success, message: 'Price cannnot be 0'})
    }


    const product = await Product.create({ sellerId, imageUrl, name, description, rating: { stars: [], count: 0 }, condition, inStock, priceCents, keywords });
    success = true;
    return res.json({ success, product, message: 'Product Added Successfuly!' });

  } catch (error) {
    console.log("Error in addproduct route", error);
    return res.status(500).send(`Server Error`);
  }
});

// Route 3 : Delete a product : DELETE :  '/api/products/deleteproduct' seller login required ([ seller only ] [ not for buyers ])

router.delete('/deleteproduct/:productId', fetchuser, checkSellerStatus, async (req, res) => {

  let success = false;

  try {
    let productToDelete = await Product.findById(req.params.productId);

    if (!productToDelete) {
      return res.status(400).json({ success, error: 'The product you are trying to delete does not exist!' })
    }
    if (req.user.id !== productToDelete.sellerId) {
      return res.status(401).json({ success, error: 'Not allowed!' });
    }
    const deleteFromBookmark = await BookmarkedItem.deleteMany({ productId: req.params.productId });
    const deleteFromCart = await CartItem.deleteMany({ productId: req.params.productId });
    productToDelete = await Product.findByIdAndDelete(req.params.productId);
    success = true;

    return res.json({ success, message: 'Product Deleted', deletedProduct: productToDelete, deleteFromBookmark, deleteFromCart });


  } catch (error) {
    console.log("Error in deleteproduct ", error);
    return res.status(500).send(`Server Error`);
  }

});


// ROUTE 4 : Edit a product : PUT :  '/api/products/editproduct' seller Log in required ([ seller only ] [ not for buyer ])

router.put('/editproduct/:productId', [
  body('imageUrl', 'Enter an image URL').notEmpty(),
  body('name', 'Product name must be atleast 5 character').isLength({ min: 5 }),
  body('condition', 'Choose the condtion of your product').notEmpty(),
  body('priceCents', 'Enter a price for your product').notEmpty(),
  body('keywords', 'Enter some keywords for your product').notEmpty(),
  body('inStock', 'Enter stock status for the product').notEmpty()
], fetchuser, checkSellerStatus, async (req, res) => {
  let success = false;
  try {
    const errors = validationResult(req);
    let newNote = {
      imageUrl: '',
      name: '',
      description: '',
      rating: {
        stars: [],
        count: 0,
      },
      condition: '',
      inStock: true,
      priceCents: 0,
      keywords: []
    };

    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    let productToEdit = await Product.findById(req.params.productId);

    if (!productToEdit) {
      return res.status(400).json({ success, error: 'Product not found!' });
    }

    if (!productToEdit.sellerId === req.user.id) {
      return res.status(400).json({ success, error: 'Not Allowed!' });
    }

    if (req.body.imageUrl) { newNote.imageUrl = req.body.imageUrl; }
    if (req.body.name) { newNote.name = req.body.name; }
    if (req.body.description) { newNote.description = req.body.description }
    if (req.body.rating) {
      newNote.rating.stars = req.body.rating.stars;
      newNote.rating.count = req.body.rating.count;
    }
    if (req.body.condition) { newNote.condition = req.body.condition }
    if (req.body.priceCents) { newNote.priceCents = req.body.priceCents };
    if (req.body.keywords) { newNote.keywords = req.body.keywords };



    productToEdit = await Product.findByIdAndUpdate(req.params.productId, { $set: newNote }, { new: true });
    success = true;

    return res.json({ success, message: 'Product Edited', productEdited: productToEdit });


  } catch (error) {
    console.error('Error: ', error);
    return res.status(400).json({ success, error: 'Internal server error occured!' })
  }

});

// ROUTE 5: Edit product's stock condition : PUT : 'api/products/editstock' seller login required ([ seller only ] [ not for buyer ])

router.put('/editstock/:productId', [body('inStock', 'Mention what to update the stock to!')], fetchuser, checkSellerStatus, async (req, res) => {
  let success = false;

  try {
    let product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(400).json({ success, error: "Product does not exist!" });
    }

    if (req.user.id !== product.sellerId) {
      return res.status(400).json({ success, error: 'Not allowed' });
    }


    product = await Product.findByIdAndUpdate(req.params.productId, { $set: { inStock: req.body.inStock } }, { new: true, runValidators: true });
    success = true;
    return res.json({ success, message: 'Product Stock Updated', product })
  } catch (error) {
    console.error('Error: ', error);
    return res.status(400).json({ success, error: 'Internal server error occured!' })
  }
});


// ROUTE 6: Fetch seller specific products: GET :  '/api/products/fetchsellerproducts' seller login required  ([ seller only ] [ not for buyer ])

router.get('/fetchsellerproducts', fetchuser, checkSellerStatus, async (req, res) => {
  let success = false;

  try {

    const sellerProducts = await Product.find({ sellerId: req.user.id });
    success = true;

    return res.json({ success, products: sellerProducts });
  } catch (error) {
    return res.status(400).json({ success, error: 'Internal server error occured!' });
  }
});

// ROUTE 7: Accept and add user's ratings on a product: POST : '/api/products/addStars'' user login   ([ buyer only ] [ not for seller ])

router.put('/addStars/:productId', fetchuser, async (req, res) => {
  let success = false;
  let reviewed = false;
  let star = req.body.stars
  try {
    if(star === 0) {
      return res.status(400).json({ success, error: "You cannot rate a product with '0' stars" });
    }

    if (!req.user.id) {
      return res.status(400).json({ success, message: 'Not allowed' });
    }

    let product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(400).json({ success, message: 'Product not found!' });
    }


    if (product.reviewedUsers.some(userId => req.user.id === userId)) {
      reviewed = true;
      return res.json({ success, message: 'You already reviewed this product!' })
    }

    const productStar = await Product.findByIdAndUpdate(req.params.productId,
      {
        $push: { 'rating.stars': req.body.stars },
        $addToSet: { 'reviewedUsers': req.user.id }
      },
      { new: true, runValidators: true })

    success = true;

    return res.json({ success, message: 'Thank you very much for rating the product!', productStar, star, reviewed });

  } catch (error) {
    console.log(error);
    return res.status(400).json({ success, errorMessage: 'Internal server error occured!' });
  }
});

module.exports = router
