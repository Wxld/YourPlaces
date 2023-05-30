const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

const placesRouter = require('./routes/places-routes')
const usersRouter = require('./routes/users-routes')
const HttpError = require('./models/http-error')

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    // this is to specify which domain name's can access the backend
    // passing '*' means any domain name can access
    res.setHeader('Access-Control-Allow-Origin', '*');

    // number 1, 2 and 4 are automatically added by the browser
    res.setHeader('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE');
    next();
})

// we will go to placesRouter middleware only when the request comes from link that starts with /api/places

// when you call next(new HttpError("Places for the current userId doesn't exist!", 404)), it skips the remaining middleware functions and goes straight to the error handling middleware, which is the second middleware function in your code.
app.use('/api/places', placesRouter);

app.use('/api/users', usersRouter);

// this middleware will only run when the above middleware's function do not send any response
app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    throw error;
});

// this is special type of middleware since it has 4 parameters and therefore it's an error middleware
app.use((error, req, res, next) => {
    // if the response for the error has already sent then just forward the error to the next middleware
    //  even if the headers have already been sent, Express.js still allows the remaining middleware functions in the chain to execute. This is because these middleware functions may not need to modify the response headers or send a response. For example, they may simply log information or perform some other operation that does not involve modifying the response.
    if(res.headerSent) {
        return next(error);
    }

    res.status(error.code || 500);
    res.json({message: error.message || "An unknown error has occured!"});
});

// only when we are connected to database, then execute backend

mongoose
    .connect("mongodb+srv://ranjeetnsut:notpassword@cluster0.kqbhtdu.mongodb.net/mern?retryWrites=true&w=majority")
    .then(() => {
        app.listen(5000);
    })
    .catch(err => {
        console.log(err);
    })
