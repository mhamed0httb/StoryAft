const responseModel = require('../models/responseModel');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        console.log("////////////////");
        console.log(req.body);
        console.log(file.filename);
        console.log(file.fieldname);
        cb(null, new Date().toISOString() + file.originalname);
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

        //console.log(ServerName + req.file.path);

        console.log(req.files);

        // Begin
        console.log("BEGIIIIIIIIIN");
        var story = JSON.parse(req.body.story);
        console.log(story.events[0].coverImage);

        let eventsLength = story.events.length;
        let filesLength = req.files.length;
        console.log(eventsLength)
        console.log(filesLength)
        if (filesLength != (eventsLength + 1)) {
            const apiResponse = responseModel(false, "Please provide all events images along with the story image", null);
            res.json(apiResponse);
        } else {
            req.files.forEach((item, index) => {
                let eventImgPath = ServerName + item.path;
                console.log(item.path + ": " + index);
                //var parsedEvents = JSON.parse(story.events)
                if (index == 0) {
                    story.coverImage = eventImgPath;
                } else {
                    story.events[index - 1].coverImage = eventImgPath;
                    story.events[index - 1].eventDate = Math.floor(story.events[index - 1].eventDate * 1000);
                }

            });

            console.log(story.events);

            story.events.forEach((item, index) => {
                console.log(item.coverImage + ": " + index);
            });

            new Story(story).save((errSave, savedStory) => {
                if (errSave) {
                    const apiResponse = responseModel(false, errSave, null);
                    res.json(apiResponse);
                } else {
                    const apiEvents = [];

                    savedStory.events.forEach((item, index) => {
                        console.log(item.coverImage + ": " + index);
                        console.log(item.eventDate + ": " + index);
                        const eventDateStampInMillis = Math.floor(savedStory.events[index].eventDate / 1000);
                        console.log(eventDateStampInMillis + ": " + index);

                        const oneEvent = {
                            _id: item._id,
                            title: item.title,
                            description: item.description,
                            coverImage: item.coverImage,
                            eventDate: eventDateStampInMillis
                        };
                        apiEvents.push(oneEvent);
                        console.log("item: " + item);
                    });
                    console.log(apiEvents);
                    const apiStory = {
                        _id: savedStory._id,
                        title: savedStory.title,
                        description: savedStory.description,
                        coverImage: savedStory.coverImage,
                        events: apiEvents
                    };

                    const apiResponse = responseModel(true, "Story saved successfully", apiStory);
                    res.json(apiResponse);
                }
            });
        }
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