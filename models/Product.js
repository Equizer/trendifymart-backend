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

RatingSchema.pre('save', function (next) {
  this.count = this.stars.length;
  next();
});
RatingSchema.pre('findOneAndUpdate', function (next) {
  if (this._update.stars) {
    this._update.count = this._update.stars.length;
    next();
  }
})

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
    type: RatingSchema
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


// {
//   "imageUrl": "sampleurl",
//   "name": "Nike Cleats",
//   "rating": {
//     "stars": [4],   // Array with the average rating or list of ratings
//     "count": 364    // Number of reviews
//   },
//   "priceCents": 1095,
//   "keywords": ["nike cleats", "boots"],
//   "condition": "new",
//   "inStock": true
// } 