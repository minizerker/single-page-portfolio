const mongoose = require('mongoose');

const ThirdPartySchema = new mongoose.Schema({
    provider_name: {
        name: String,
        default: null
    },

    provider_id: {
        type: String,
        default: null
    },

    provider_data: {
        type: {},
        default: null,
    }
})

//User Schema
const UserSchema = new mongoose.Schema({
    name: {

        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    email_is_verified: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        minlength: 8
    },
    third_party_auth: [ThirdPartySchema],
    date: {
        type: Date,
        default: Date.now
    }
}, {strict: false}
);

module.exports = User = mongoose.model("users", UserSchema);