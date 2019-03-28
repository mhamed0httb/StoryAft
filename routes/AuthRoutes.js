const express = require('express');

var routes = (User) => {
    const authRouter = express.Router();

    const authController = require('../controllers/AuthController')(User);

    authRouter.route('/login').post(authController.postLogin);

    authRouter.route('/signup').post(authController.veryfyPasswordMatch, authController.postSignup);

    return authRouter;
};

module.exports = routes;