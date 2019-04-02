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

    var getProfile = (req, res) => {
        let data = req.authData;
        let token = req.token;
        data.user.token = token;
        let apiData = data.user;
        const apiResponse = responseModel(true, "User Profile", apiData);
        res.status(403).json(apiResponse);
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
        getProfile
    }
};

module.exports = profileController;