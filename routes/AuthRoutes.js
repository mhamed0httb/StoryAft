const express = require('express');
const responseModel = require('../models/ResponseModel');
const jwt = require('jsonwebtoken');

var routes = (User) => {
    const authRouter = express.Router();

    const authController = require('../controllers/AuthController')(User);

    authRouter.route('/login').post(authController.verifyToken, authController.postLogin);
    /*
    authRouter.route('/login').post(verifyToken,(req, res) => {
        jwt.verify(req.token, 'secretkey', (err, authData) => {
            if (err) {
                res.status(403).json({ err });
            } else {
                res.json({
                    message: 'post created',
                    authData
                });
            }
        });


    });
    */


   authRouter.route('/signup').post(authController.veryfyPasswordMatch, authController.postSignup);

    /*
    authRouter.route('/signup').post((req, res) => {
        var requestBody = req.body;
        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
        console.log(requestBody);
        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
        var user = new User(requestBody);
        user.save((err, user) => {
            if (err) {
                console.log(err);
                const apiResponse = responseModel(false, err, null);
                res.json(apiResponse);
            } else {
                console.log(err);
                const userTimeStampInMillis = Math.floor(user.createdOn / 1000);
                apiUser = {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    createdOn: userTimeStampInMillis
                };

                jwt.sign({ user: apiUser }, 'secretkey', { expiresIn: '30s' }, (errJwt, token) => {
                    if (errJwt) {
                        console.log(err);
                        const apiResponse = responseModel(false, errJwt, null);
                        res.json(apiResponse);
                    } else {
                        apiUser.token = token;
                        const apiResponse = responseModel(true, "User account created with success", apiUser);
                        res.json(apiResponse);
                    }

                });


            }
        });
    });
    */

    //verify token
    function verifyToken(req, res, next) {
        // Get auth header value
        const bearerHeader = req.headers['authorization'];
        console.log(bearerHeader);
        //Check if bearer is undefined
        if (typeof bearerHeader !== 'undefined') {
            // Split at the space
            const bearer = bearerHeader.split(' ');
            // Get token from array
            const bearerToken = bearer[1];
            // Set the token
            req.token = bearerToken;
            next();
        } else {
            // Forbidden
            res.sendStatus(403);
        }

    }

    return authRouter;
};

module.exports = routes;