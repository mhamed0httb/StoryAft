const express = require('express');

var routes = (Story, User) => {
    const storyRouter = express.Router();

    const storyController = require('../controllers/StoryController')(Story, User);

    storyRouter.route('/create').post(storyController.verifyToken, storyController.postCreateStory);

    //storyRouter.route('/upload').post(storyController.verifyToken, storyController.upload.array('eventsImages', 10), storyController.postUploadFile);

    storyRouter.route('/getAll').get(storyController.verifyToken, storyController.getAll);

    storyRouter.route('/delete/:storyId').delete(storyController.verifyToken, storyController.deleteStory);

    return storyRouter;
};

module.exports = routes;