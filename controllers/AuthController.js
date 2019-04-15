const responseModel = require('../models/ResponseModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var authController = (User) => {

    const { JwtSecret } = require('../config/Keys');

    var postLogin = (req, res) => {
        var requestBody = req.body;

        User.findOne({ email: requestBody.email }, (err, user) => {
            if (err) {
                console.log(err);
                const apiResponse = responseModel(false, err, null);
                res.json(apiResponse);
            } else {
                if (user == null) {
                    const apiResponse = responseModel(false, "Invalid credentials", null);
                    res.json(apiResponse);
                } else {
                    bcrypt.compare(requestBody.password, user.password, (errCompare, result) => {
                        if (errCompare) {
                            console.log(errCompare);
                            const apiResponse = responseModel(false, errCompare, null);
                            res.json(apiResponse);
                        } else {
                            if (result) {
                                const userTimeStampInMillis = Math.floor(user.createdOn / 1000);
                                apiUser = {
                                    _id: user._id,
                                    firstName: user.firstName,
                                    lastName: user.lastName,
                                    email: user.email,
                                    createdOn: userTimeStampInMillis
                                };

                                jwt.sign({ user: apiUser }, JwtSecret, { expiresIn: '30d' }, (errJwt, token) => {
                                    if (errJwt) {
                                        console.log(errJwt);
                                        const apiResponse = responseModel(false, errJwt, null);
                                        res.json(apiResponse);
                                    } else {
                                        apiUser.token = token;
                                        const apiResponse = responseModel(true, "User logged in", apiUser);
                                        res.json(apiResponse);
                                    }
                                });

                            } else {
                                const apiResponse = responseModel(false, "Invalid Password", null);
                                res.json(apiResponse);
                            }
                        }
                    });
                }
            }
        });
    };

    var postSignup = (req, res) => {
        var requestBody = req.body;
        var user = new User(requestBody);

        bcrypt.genSalt(10, (errSalt, salt) => {
            if (errSalt) {
                console.log(errSalt);
                const apiResponse = responseModel(false, errSalt, null);
                res.json(apiResponse);
            } else {
                bcrypt.hash(user.password, salt, (errHash, hash) => {
                    if (errHash) {
                        console.log(errHash);
                        const apiResponse = responseModel(false, errHash, null);
                        res.json(apiResponse);
                    } else {
                        user.password = hash;
                        console.log(hash);
                        user.save((err, user) => {
                            if (err) {
                                console.log(err);
                                const apiResponse = responseModel(false, err, null);
                                res.json(apiResponse);
                            } else {
                                const userTimeStampInMillis = Math.floor(user.createdOn / 1000);
                                apiUser = {
                                    _id: user._id,
                                    firstName: user.firstName,
                                    lastName: user.lastName,
                                    email: user.email,
                                    createdOn: userTimeStampInMillis
                                };

                                jwt.sign({ user: apiUser }, JwtSecret, { expiresIn: '30d' }, (errJwt, token) => {
                                    if (errJwt) {
                                        console.log(errJwt);
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
                    }

                });
            }

        });
    };

    var verifyToken = (req, res, next) => {
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
    };

    var veryfyPasswordMatch = (req, res, next) => {
        var requestBody = req.body;
        var pass1 = requestBody.password;
        var pass2 = requestBody.confirmPassword;
        if (pass1 == pass2) {
            next();
        } else {
            const apiResponse = responseModel(false, "Password does not match", null);
            res.json(apiResponse);
        }
    };


    return {
        postLogin,
        postSignup,
        verifyToken,
        veryfyPasswordMatch
    }

};


module.exports = authController;