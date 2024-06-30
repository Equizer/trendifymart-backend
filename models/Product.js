const mongoose = require('mongoose');
const { Schema } = mongoose;

const RatingSchema = new Schema({
  stars: {
    type: [Number],
    default: []
  },
  count: {
    type: Number,
    default: 0
  }
});

const ProductSchema = new Schema({
  sellerId: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  rating: {
    type: RatingSchema,
    required: true
  },
  priceCents: {
    type: Number,
    required: true
  },
  condition: {
    type: String,
    required: true
  },
  inStock: {
    type: Boolean,
    required: true
  },
  keywords: {
    type: Array,
    required: true
  },
  reviewedUsers: {
    type: Array,
    default: [],
  },
  dateProductAdded: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model('products', ProductSchema);
module.exports = Product;


/* 
this is a sample of the body for adding a product 
{
  "imageUrl": "sampleurl",
  "name": "Nike Cleats",
  rating: {
    stars: 4,
    count: 364
  },
  priceCents: 1095,
  keywords: ["nike cleats", "boots"]
} */ 