const mongoose = require('mongoose');

const Product = require('./models/product');

mongoose.connect(
    "mongodb+srv://ranjeetnsut:notpassword@cluster0.kqbhtdu.mongodb.net/products_test?retryWrites=true&w=majority"
).then(() => {
    console.log("Connected to the database!");
}).catch(() => {
    console.log("Connection failed!");
});

const createProduct = async (req, res, next) => {
    const createdProduct = new Product({
        name: req.body.name,
        price: req.body.price
    });

    // createdProduct is saved in the db now, database is accessed from Product model and
    // collection is received from 
    const result = await createdProduct.save();

    res.json(result);
};

const getProducts = async (req, res, next) => {
    // use of exec is done to convert the product.find() to a promise
    const products = await Product.find().exec();
    res.json(products);
}

exports.createProduct = createProduct;
exports.getProducts = getProducts;