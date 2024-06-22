const mongoose = require('mongoose')
const { Schema } = mongoose;


const RatingSchema = new Schema({
  stars: {
    type: [Number],
    required: true
  },
  count: {
    type: Number,
    required: true
  }
})

const BookmarkedItemSchema = new Schema({
  productId: {
    type: String,
    required: true
  },
  sellerId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    rqeuired: true
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
  quantity: {
    type: Number,
    required: true
  },
  keywords: {
    type: Array,
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
  dateAdded: {
    type: Date,
    default: Date.now
  }
});

const BookmarkedItem = mongoose.model('bookmarked items', BookmarkedItemSchema)
module.exports = BookmarkedItem