const mongoose = require('mongoose')
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  gender: {
    type: 'String',
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  dateJoined: {
    type: Date,
    default: Date.now
  },
  seller: {
    type: Boolean,
    default: false
  }
});

const User = mongoose.model('user', UserSchema);
module.exports = User;