const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {type: String, required: true},
    price: {type: Number, required: true}
});

// 'Product' will be the collection name, also it will be converted into 'products'
module.exports = mongoose.model('Product', productSchema);