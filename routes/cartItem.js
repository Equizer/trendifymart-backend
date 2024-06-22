const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const { body, validationResult } = require('express-validator');


// ROUTE 1: Fetch Cart Items (buyer specific items) : GET : '/api/cartitems/fetchcartitems' buyer login required   
router.get('/fetchcartitems', fetchuser, async (req, res) => {
  let success = false;
  try {
    const userId = req.user.id;
    const allProducts = await CartItem.find({ userId });
    success = true;
    return res.json({ success, allProducts });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success, error: 'Internal server error occured!' });
  }
});





// ROUTE 2: Add a product to Cart: '/api/cartitems/addtocart' buyer login required   

router.post('/addtocart/:productId', [
  body('quantity', 'Enter the quantity of the product').notEmpty()
], fetchuser, async (req, res) => {
  let success = false;
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success, error: errors.array() })
    }
    let productToAdd = await Product.findById(req.params.productId);

    if (!productToAdd) {
      return res.status(400).json({ success, error: 'Product not Found' });
    }

    const userAllCartItems = await CartItem.find({ userId: req.user.id });

    const existingCartItem = userAllCartItems.find(item => item.productId === req.params.productId);


    if (existingCartItem) {
      const cartItem = await CartItem.findByIdAndUpdate(existingCartItem._id, { $set: { quantity: existingCartItem.quantity + parseInt(req.body.quantity) } }, { new: true });
      success = true;
      return res.json({ success, message: 'Product already existed in the cart so the quantity incremented!', cartItem, added: false }) // added boolean is sent so that we can find if the product was added or just the quantity was increased 
    }
    else {
      productToAdd = {
        productId: productToAdd._id,
        sellerId: productToAdd.sellerId,
        userId: req.user.id,
        imageUrl: productToAdd.imageUrl,
        name: productToAdd.name,
        description: productToAdd.description,
        rating: {
          stars: productToAdd.rating.stars,
          count: productToAdd.rating.count
        },
        quantity: req.body.quantity,
        priceCents: productToAdd.priceCents,
        keywords: productToAdd.keywords,
        inStock: productToAdd.inStock,
        condition: productToAdd.condition,
      }

      const addProduct = await CartItem.create(productToAdd);
      success = true;
      return res.json({ success, message: 'Product added to the Cart', product: addProduct, added: true }); // added is sent so that we can find if the product was added or just the quantity was increased 
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success, error: 'Internal server error occured!' });
  }
});

// ROUTE 3: Delete a product from Cart: DELETE: '/api/cartitems/deletefromcart'  buyer login required

router.delete('/deletefromcart/:cartItemId', fetchuser, async (req, res) => {
  let success = false;
  try {
    let product = await CartItem.findById(req.params.cartItemId);
    if (!product) {
      return res.status(400).json({ success, error: 'Product not found in Cart' });
    }
    if (req.user.id !== product.userId) {
      return res.status(400).json({ success, error: "Not Allowed!" });
    }
    product = await CartItem.findByIdAndDelete(req.params.cartItemId);
    success = true;
    return res.json({ success, message: 'Product Deleted', product });

  } catch (error) {
    console.log(error);
    return res.status(400).json({ success, error: 'Internal server error occured!' });
  }
});

// ROUTE 4: Edit Cart item's quantity : PUT '/api/cartitems/editquantity'  buyer login required

router.put('/editquantity/:cartItemId', [
  body('quantity', 'Enter quantity!').notEmpty()
], fetchuser, async (req, res) => {
  let success = false;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(400).json({ success, error: errors.array() });
    }
    if (req.body.quantity <= 0) {
      return res.status(400).json({ success, error: 'Cannot set the quantity to negative or null' })
    }

    let product = await CartItem.findById(req.params.cartItemId);

    if (!product) {
      return res.status(400).json({ success, error: 'Product not found' });
    }

    if (req.user.id !== product.userId) {
      return res.status(400).json({ success, error: 'Not Allowed!' });
    }

    product = await CartItem.findByIdAndUpdate(req.params.cartItemId, { $set: { quantity: req.body.quantity } }, { new: true, runValidations: true }) /*new: true: When new is set to true, the findByIdAndUpdate() method returns the updated document after the update operation has been applied. By default, without new: true, it returns the document as it was before the update.
    runValidators: true: Setting runValidators to true ensures that Mongoose runs any validation checks defined in the schema before performing the update. These validations can include checking for required fields, data types, custom validators, and other constraints specified in the schema. If any of these validations fail, the update operation will be rejected, and the document won't be updated.*/

    success = true;
    return res.json({ success, message: 'Cart quantity updated', product });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success, error: 'Internal server error occured!' });
  }
})
module.exports = router;