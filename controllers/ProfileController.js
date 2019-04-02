const responseModel = require('../models/responseModel');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        const arrayMimeType = file.mimetype.split('/');
        const type = arrayMimeType[arrayMimeType.length - 1];
        cb(null, file.fieldname + '-' + new Date().toISOString() + '.' + type);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(new multer.MulterError('Accept only png or jpeg'), false);
    }
};

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

var profileController = (User) => {

    var uploadProfileImage = (req, res) => {
        upload.single('profileImage')(req, res, (err) => {
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
                let user = req.authData.user;
                let profileImgPath = ServerName + req.file.path;
                console.log(user._id);
                console.log(user);
                User.findById(user._id, (err, found) => {
                    console.log("User found from MongoDB");
                    console.log(found);
                    console.log("*****");
                    if (err) {
                        const apiResponse = responseModel(false, "User not found", null);
                        res.status(404).json(apiResponse);
                    } else {
                        found.image = profileImgPath;
                        found.save((errSave) => {
                            if (errSave) {
                                const apiResponse = responseModel(false, errSave, null);
                                res.status(500).json(apiResponse);
                            } else {
                                const apiResponse = responseModel(true, "Profile image uploaded with success", found);
                                res.json(apiResponse);
                            }
                        });
                    }
                });

            }
        });
    }

    var getProfile = (req, res) => {
        let data = req.authData;
        let token = req.token;

        User.findById(data.user._id, (err, found) => {
            if (err) {
                const apiResponse = responseModel(false, "User not found", null);
                res.status(404).json(apiResponse);
            } else {
                const createdOn = Math.floor(found.createdOn / 1000);
                let apiData = {
                    _id: found._id,
                    firstName: found.firstName,
                    lastName: found.lastName,
                    email: found.email,
                    createdOn,
                    image: found.image,
                    token: token
                }
                const apiResponse = responseModel(true, "User Profile", apiData);
                res.json(apiResponse);
            }
        })


        /*
         data.user.token = token;
         let apiData = data.user;
         const apiResponse = responseModel(true, "User Profile", apiData);
         res.json(apiResponse);
        */
    };

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

    return {
        verifyToken,
        getProfile,
        uploadProfileImage
    }
};

module.exports = profileController;