const MongoClient = require('mongodb').MongoClient;

const url = "mongodb+srv://ranjeetnsut:notpassword@cluster0.kqbhtdu.mongodb.net/products_test?retryWrites=true&w=majority";

const postProducts = async (req, res, next) => {
    const newProduct = {
        name: req.body.name,
        price: req.body.price
    }
    
    // through this we specify to which server we want to connect
    const client = new MongoClient(url);

    try {
        // connecting to the client/server
        await client.connect();
        // storing database in which we want to make updates
        // we can specify the collections name inside the db parenthesis
        // eg. client.db("cars")
        // if we don't provide then it takes it from the url that we specify
        const db = client.db();
        // in database, in which collection you want to add
        const result = await db.collection('products').insertOne(newProduct);

    } catch (error) {
        console.error(error);
        return res.json({message: "Could not add the product!"});
    } 

    client.close();
    res.json(newProduct);
}

const getProducts = async (req, res, next) => {
    // through this we specify to which server we want to connect
    const client = new MongoClient(url);
    let products;

    try {
        // connecting to the client/server
        await client.connect();
        // storing database in which we want to make updates
        // we can specify the collections name inside the db parenthesis
        // eg. client.db("cars")
        // if we don't provide then it takes it from the url that we specify
        const db = client.db();
        // in database, in which collection you want to find
        products = await db.collection('products').find().toArray();
    } catch (error) {
        console.error(error);
        return res.json({message: "Could not retrieve the product!"});
    } 

    client.close();
    res.json(products);
}

exports.getProducts = getProducts;
exports.postProducts = postProducts;