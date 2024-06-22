const mongoose = require('mongoose');
const { Schema } = mongoose;

const SellerSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  shopName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  type: {
    type: String,
    require: true
  },
  state: {
    type: String,
    required: true
  },
  seller: {
    type: Boolean,
    default: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  dateJoined: {
    type: Date,
    default: Date.now
  }
});


// a suggestion would be that every product should have the _id from this schema which would be the seller id and also in this schema we could also store the seller all products



const Seller = mongoose.model('seller', SellerSchema);
module.exports = Seller;