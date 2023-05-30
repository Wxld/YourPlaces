const express = require('express');
const { check } = require('express-validator');

const usersControllers = require('../controllers/users-controller');
/*
Router is a middleware that allows you to define multiple routes and handle HTTP requests.
By calling express.Router(), you create a new Router object and assign it to the variable router. 
*/
const router = express.Router();

router.get('/', usersControllers.getUsers);

router.post('/signup', 
[
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 8 }),
],
usersControllers.signup);

router.post('/login', usersControllers.login);

module.exports = router;