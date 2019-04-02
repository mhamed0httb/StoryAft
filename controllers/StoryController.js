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
        console.log(file.originalname);
        console.log(file.mimetype);
        console.log(file);
        const arrayMimeType = file.mimetype.split('/');
        const type = arrayMimeType[arrayMimeType.length - 1];
        //cb(null, new Date().toISOString()clear + file.originalname);
        cb(null, file.fieldname + '-' + new Date().toISOString() + '.' + type);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(new multer.MulterError('Accept only png or jpeg'), false);
    }
}

const upload = multer(
    {
        storage: storage,
        limits: {
            fileSize: 1024 * 1024 * 5 //5Mb
        },
        fileFilter: fileFilter
    }
);

const { JwtSecret, ServerName } = require('../config/Keys');

var storyController = (Story, User) => {

    var postCreate = (req, res) => {
        jwt.verify(req.token, JwtSecret, (err, authData) => {
            if (err) {
                const apiResponse = responseModel(false, err, null);
                res.status(403).json(apiResponse);
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
        const bearerHeader = req.headers['authorization'];
        console.log(bearerHeader);
        if (typeof bearerHeader !== 'undefined') {
            const bearer = bearerHeader.split(' ');
            const bearerToken = bearer[1];
            jwt.verify(bearerToken, JwtSecret, (err, authData) => {
                if (err) {
                    const apiResponse = responseModel(false, err.message, null);
                    res.status(403).json(apiResponse);
                } else {
                    req.token = bearerToken;
                    req.authData = authData;
                    next();
                }
            });
        } else {
            // Forbidden
            const apiResponse = responseModel(false, "Invalid token", null);
            res.status(403).json(apiResponse);
        }
    };

    var postCreateStory = (req, res) => {
        /*
        upload.array('eventsImages', 10)(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                console.log(err);
                const apiResponse = responseModel(false, err.code, null);
                res.status(500).json(apiResponse);
            } else if (err) {
                // An unknown error occurred when uploading.
                console.log(err);
                const apiResponse = responseModel(false, err, null);
                res.status(403).json(apiResponse);
            } else {
                const apiResponse = responseModel(false, "nothing", null);
                res.status(403).json(apiResponse);
            }
        });
        */

        upload.fields([{ name: 'storyImage', maxCount: 1 }, { name: 'eventsImages', maxCount: 10 }])(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                console.log(err);
                const apiResponse = responseModel(false, err.code, null);
                res.status(500).json(apiResponse);
            } else if (err) {
                // An unknown error occurred when uploading.
                console.log(err);
                const apiResponse = responseModel(false, err, null);
                res.status(403).json(apiResponse);
            } else {
                // Begin
                console.log("BEGIIIIIIIIIN");
                var story = JSON.parse(req.body.story);

                let eventsLength = story.events.length;
                let filesLength = req.files['eventsImages'].length;

                if (filesLength != eventsLength) {
                    const apiResponse = responseModel(false, "Please provide all events images along with the story image", null);
                    res.json(apiResponse);
                } else {
                    req.files['eventsImages'].forEach((item, index) => {
                        let eventImgPath = ServerName + item.path;
                        console.log(item.path + ": " + index);
                        //var parsedEvents = JSON.parse(story.events)
                        story.events[index].coverImage = eventImgPath;
                        story.events[index].eventDate = Math.floor(story.events[index].eventDate * 1000);
                    });

                    let storyImgPath = ServerName + req.files['storyImage'][0].path;
                    story.coverImage = storyImgPath;

                    story.owner = req.authData.user._id;

                    new Story(story).save((errSave, savedStory) => {
                        if (errSave) {
                            const apiResponse = responseModel(false, errSave, null);
                            res.json(apiResponse);
                        } else {
                            const apiEvents = [];

                            savedStory.events.forEach((item, index) => {
                                const eventDateStampInMillis = Math.floor(savedStory.events[index].eventDate / 1000);
                                const oneEvent = {
                                    _id: item._id,
                                    title: item.title,
                                    description: item.description,
                                    coverImage: item.coverImage,
                                    eventDate: eventDateStampInMillis
                                };
                                apiEvents.push(oneEvent);
                            });

                            /*
                                Find the owner
                            */
                            User.findById(savedStory.owner, (errOwner, foundOwner) => {
                                if (errOwner) {
                                    const apiResponse = responseModel(false, errOwner, null);
                                    res.json(apiResponse);
                                } else {
                                    const createdOn = Math.floor(foundOwner.createdOn / 1000);
                                    const apiOwner = {
                                        _id: foundOwner._id,
                                        firstName: foundOwner.firstName,
                                        lastName: foundOwner.lastName,
                                        email: foundOwner.email,
                                        createdOn,
                                        image: foundOwner.image
                                    };
                                    const apiStory = {
                                        _id: savedStory._id,
                                        title: savedStory.title,
                                        description: savedStory.description,
                                        coverImage: savedStory.coverImage,
                                        events: apiEvents,
                                        owner: apiOwner
                                    };

                                    const apiResponse = responseModel(true, "Story saved successfully", apiStory);
                                    res.json(apiResponse);
                                }
                            });

                        }
                    });
                }
            }
        });
    };

    var getAll = (req, res) => {
        var query = {};

        var pageLimit = req.query.limit;
        var pageNumber = req.query.page;

        if (pageLimit && pageNumber) {
            var parsedLimit = parseInt(pageLimit, 10);
            var parsedPage = parseInt(pageNumber, 10);

            if (isNaN(parsedLimit) || isNaN(parsedPage)) {
                Story.find()
                    .sort({
                        createdOn: 'desc'
                    })
                    .populate('owner')
                    .exec((errGet, stories) => {
                        if (errGet) {
                            const apiResponse = responseModel(false, errGet, null);
                            res.status(500).json(apiResponse);
                        } else {
                            const response = formatStoriesForAPI(stories);
                            const apiData = {
                                stories: response,
                                total: response.length
                            };
                            const apiResponse = responseModel(true, "All Stories", apiData);
                            res.json(apiResponse);
                        }
                    });
            } else {
                Story.find()
                    .limit(parsedLimit)
                    .skip(pageLimit * parsedPage)
                    .sort({
                        createdOn: 'desc'
                    })
                    .populate('owner')
                    .exec((errGet, stories) => {
                        if (errGet) {
                            const apiResponse = responseModel(false, errGet, null);
                            res.status(500).json(apiResponse);
                        } else {
                            const response = formatStoriesForAPI(stories);
                            const apiData = {
                                stories: response,
                                total: response.length,
                                pageLimit: parsedLimit,
                                pageNumber: parsedPage
                            };
                            const apiResponse = responseModel(true, "All Stories", apiData);
                            res.json(apiResponse);
                        }
                    });
            }
        } else {
            Story.find()
                .sort({
                    createdOn: 'desc'
                })
                .populate('owner')
                .exec((errGet, stories) => {
                    if (errGet) {
                        const apiResponse = responseModel(false, errGet, null);
                        res.status(500).json(apiResponse);
                    } else {
                        const response = formatStoriesForAPI(stories);
                        const apiData = {
                            stories: response,
                            total: response.length
                        };
                        const apiResponse = responseModel(true, "All Stories", apiData);
                        res.json(apiResponse);
                    }
                });
        }
    };

    var formatStoriesForAPI = (stories) => {
        const apiStories = [];
        stories.forEach((item, index) => {
            const apiEvents = [];
            stories[index].events.forEach((itemEv, indexEv) => {
                const eventDateStampInMillis = Math.floor(stories[index].events[indexEv].eventDate / 1000);
                const oneEvent = {
                    _id: itemEv._id,
                    title: itemEv.title,
                    description: itemEv.description,
                    coverImage: itemEv.coverImage,
                    eventDate: eventDateStampInMillis
                };
                apiEvents.push(oneEvent);
            });

            const ownerDateStampInMillis = Math.floor(item.owner.createdOn / 1000);
            const oneOwner = {
                _id: item.owner._id,
                firstName: item.owner.firstName,
                lastName: item.owner.lastName,
                email: item.owner.email,
                createdOn: ownerDateStampInMillis,
                image: item.owner.image
            };

            const oneStory = {
                _id: item._id,
                title: item.title,
                description: item.description,
                coverImage: item.coverImage,
                events: apiEvents,
                owner: oneOwner
            };
            apiStories.push(oneStory);
        });
        return apiStories;
    };


    return {
        postCreate,
        postUploadFile,
        upload,
        verifyToken,
        postCreateStory,
        getAll
    };
};

module.exports = storyController;