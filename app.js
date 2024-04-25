const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');
const errorHandlerMiddleware = require('./middleware/error')
app.use(express.json());
app.use(cookieParser());

const products = require('./routes/productRoute');
const auth = require('./routes/authRoute');
const Order = require('./routes/orderRoute');

app.use('/api/v1', auth);
app.use('/api/v1', products);
app.use('/api/v1', Order);
app.use(errorHandlerMiddleware);

module.exports = app