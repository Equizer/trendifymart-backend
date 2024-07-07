const connectToMongo = require('./db.js');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

connectToMongo();
const app = express();

const port = process.env.PORT || 5000; //commmented out rn but remove it when launching the app
// const port = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cartitems', require('./routes/cartItem.js'));
app.use('/api/bookmarkeditems', require('./routes/bookmarkedItem.js'));

app.get('/', (req, res) => {
  res.send('Welcome to TrendifyMart Backend');
});

app.listen(port, () => {
  console.log(`TrendifyMart backend listening at http://localhost:${port}`);
});
