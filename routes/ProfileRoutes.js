const express = require('express');

var routes = (User) => {
    const profileRouter = express.Router();

    const profileController = require('../controllers/ProfileController')(User);

    profileRouter.route('/get').get(profileController.verifyToken, profileController.getProfile);

    profileRouter.route('/image').put(profileController.verifyToken, profileController.uploadProfileImage);

    return profileRouter;
};

module.exports = routes;