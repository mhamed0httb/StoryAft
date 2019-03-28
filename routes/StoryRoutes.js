const express = require('express');

var routes = (Story) => {
    const storyRouter = express.Router();

    const storyController = require('../controllers/StoryController')(Story);

    storyRouter.route('/create').post(storyController.verifyToken, storyController.postCreate);

    storyRouter.route('/upload').post(storyController.upload.single('productImage'), storyController.postUploadFile);


    return storyRouter;
};

module.exports = routes;