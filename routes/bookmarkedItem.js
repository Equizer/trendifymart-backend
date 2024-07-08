const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');
const BookmarkedItem = require('../models/BookmarkedItem');
const Product = require('../models/Product');

// ROUTE 1: Fetch user specific bookmarked items  GET '/api/bookmarkeditems/fetchuserbookmarkeditems'

router.get('/fetchuserbookmarkeditems', fetchuser, async (req, res) => {
  let success = false;
  try {
    const allBookmarkedItems = await BookmarkedItem.find({ userId: req.user.id });
    success = true;
    return res.json({ success, allBookmarkedItems });

  } catch (error) {
    return res.status(400).json({ success, error: error.message, 'message': 'error occured' });
  }
});

// ROUTE 2: Add / bookmark a product POST '/api/bookmarkeditems/addbookmark' buyer login required 

router.post('/addbookmark/:productId', fetchuser, [
  body('quantity', 'Please select a quantity').notEmpty()
], async (req, res) => {
  let success = false;

  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, error: errors.array() })
    }

    let product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(400).json({ success, error: 'Product does not exists!' });
    }

    let bookmarkedOrNot = await BookmarkedItem.findOne({ productId: req.params.productId });

    if (!bookmarkedOrNot) {

      const productToAdd = {
        productId: product._id,
        sellerId: product.sellerId,
        userId: req.user.id,
        imageUrl: product.imageUrl,
        name: product.name,
        description: product.description,
        rating: {
          stars: product.rating.stars || [],
          count: product.rating.count || 0
        },
        priceCents: product.priceCents,
        quantity: req.body.quantity,
        keywords: product.keywords,
        condition: product.condition,
        inStock: product.inStock,
      };

      const addProduct = await BookmarkedItem.create(productToAdd);
      success = true;
      return res.json({ success, message: 'Product Bookmarked!', addProduct })
    }

    else {
      const removeBookmark = await BookmarkedItem.findByIdAndDelete(bookmarkedOrNot._id,{ new: true })
      success = true
      return res.json({ success, message: "Bookmark Removed", removedBookmark: removeBookmark });
    }

  } catch (error) {
    return res.status(400).json({ success, error: error.message, 'message': 'error occured' });
  }
});


module.exports = router;