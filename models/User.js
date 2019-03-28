var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

var userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        match: emailRegex,
        unique: true
    },
    image: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    createdOn: {
        type: Date,
        default: Date.now,
        timestamp: true
    }
});

module.exports = mongoose.model('User', userSchema);