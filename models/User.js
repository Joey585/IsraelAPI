const {Schema, model} = require("mongoose");

const userSchema = new Schema({
    username: String,
    id: String,
    oauth2_type: String,
    stats: {
        likes_received: Number,
        followers: Number,
        following: Number,
        likes_given: Number,
        posts_created: Number,
    },
    avatarURL: String,
    admin: Boolean,
    aboutMe: String,
    dateJoined: Number,
    token: String
});

const User = model("User", userSchema);

module.exports = User
