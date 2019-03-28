const responseModel = require('../models/responseModel');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        //cb(null, new Date().toISOString() + file.originalname);
        console.log("////////////////");
        console.log(req.body);
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

const { JwtSecret, ServerName } = require('../config/Keys');

var storyController = (Story) => {
    var postCreate = (req, res) => {

        

        jwt.verify(req.token, JwtSecret, (err, authData) => {
            if (err) {
                const apiResponse = responseModel(false, err, null);
                res.sendStatus(403).json(apiResponse);
            } else {
                const requestBody = req.body;


                if (typeof requestBody.events !== 'undefined') {
                    console.log(requestBody.events.length);

                    var story = new Story(requestBody);
                    story.save((errSave, savedStory) => {
                        if (errSave) {
                            const apiResponse = responseModel(false, errSave, null);
                            res.json(apiResponse);
                        } else {
                            const apiResponse = responseModel(true, "Story saved successfully", savedStory);
                            res.json(apiResponse);
                        }
                    });

                } else {
                    const apiResponse = responseModel(false, "Please provide the story Events", null);
                    res.status(403).json(apiResponse);
                }
                /*
                res.json({
                    message: 'post created',
                    user: authData.user
                });
                */
            }
        });

    };

    var postUploadFile = (req, res) => {
        console.log(req.file);
        console.log(req.body.name);
        console.log(req.body.price);
        var parsedParam = JSON.parse(req.body.story);
        console.log(parsedParam);
        console.log("***********");
        console.log(parsedParam.events);

        console.log(ServerName + req.file.path);

    }

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
            const apiResponse = responseModel(false, "Invalid token", null);
            res.sendStatus(403).json(apiResponse);
        }
    };

    return {
        postCreate,
        verifyToken,
        postUploadFile,
        upload
    };
};

module.exports = storyController;