const {v4: uuid} = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers = async (req, res, next) => {
    let users;

    try {
        users = await User.find({}, '-password');
    } catch(err) {
        const error = new HttpError('Something went wrong, try again later!', 500);
        return next(error);
    }

    res.json({users : users.map(user => user.toObject({ getters: true }))});
}

const login = async (req, res, next) => {
    const {email, password} = req.body;

    let identifiedUser;

    try {
        identifiedUser = await User.findOne({ email: email });
    } catch(err) {
        const error = new HttpError('Something went wrong, please try to login later.', 500);

        return next(error);
    }

    if(!identifiedUser || identifiedUser.password !== password) {
        const error = new HttpError('Incorrect password!', 401);
        return next(error);
    }

    res.json({message: 'Loggen in!'});
}

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return next(new HttpError('Invalid input(s)!', 422));
    }

    const {name, email, password} = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('Something went wrong, Please try again later.', 500);

        return next(error);
    }

    if(existingUser) {
        const error = new HttpError('Email is already registered, Login instead.', 422);

        return next(error);
    }

    const newUser = new User({
        name,
        email,
        password,
        image: "https://images.app.goo.gl/Vfu4iJdnJXNLxGQZ8",
        places: []
    });

    try {
        await newUser.save();
    } catch (err) {
        const error = new HttpError('Could not signup, Please try again later.', 500);

        return next(error);
    }

    res.json({ user: newUser.toObject({ getters: true }) }).status(201);
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;