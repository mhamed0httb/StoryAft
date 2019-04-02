var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var User = require('./User');

var storySchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    coverImage: {
        type: String,
        required: true
    },
    events: [
        {
            title: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true
            },
            coverImage: {
                type: String,
                required: true
            },
            eventDate: {
                type: Date,
                required: true
            }
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

var eventSchema = new Schema({
    titleEv: {
        type: String,
        required: true,
    },
    descriptionEv: {
        type: String,
        required: true
    },
    coverImageEv: {
        type: String,
        required: true
    },
    eventDateEv: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Story', storySchema);