const axios = require("axios");
const database = require("./database");
const config = require("../config.json");
const User = require("../models/User")
const {createUserID, userExists} = require("./database");
const {createTokenFromDiscord} = require("./security");

const getAccessToken = (code, local) => new Promise(async (resolve, reject) => {
    const collection = await database.connect(config.mongoURI, "config");
    const clientInfo = await collection.findOne({id: "client-info"});

    axios.post("https://discord.com/api/oauth2/token", {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": local ? "http://localhost:3000/callback" : "https://israelupsates.blue/callback"
    }, {auth: {username: clientInfo.clientID, password: clientInfo.clientSecret}, headers: {"Content-type": "application/x-www-form-urlencoded"}}).then((res) => {
        return resolve(res.data)
    }).catch((e) => {
        return reject(e.code)
    })
});

const getUserData = (accessToken) => new Promise(async (resolve, reject) => {
    axios.get("https://discord.com/api/users/@me", {headers: {Authorization: `Bearer ${accessToken}`}}).then((res) => {
        resolve(res.data);
    }).catch((e) => {
        console.log(e)
        reject(e);
    });
});

const createAccount = (accessToken) => new Promise(async (resolve, reject) => {
    const userData = await getUserData(accessToken);
    const token = createTokenFromDiscord(userData.id);

    if(await userExists(userData.username)){
        const user = await User.findOne({username: userData.username})
        return resolve(user.token);
    }

    const user = new User({
        username: userData.username,
        id: await createUserID(config.mongoURI),
        oauth2_type: "discord",
        stats: {
            likes_received: 0,
            likes_given: 0,
            posts_created: 0,
        },
        avatarURL: `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.webp?size=160`,
        admin: false,
        aboutMe: "",
        dateJoined: Date.now(),
        token: token
    });

    user.save().then(() => {
        resolve(token)
    }).catch((e) => {
        reject(e);
    })
});

module.exports = {getAccessToken, createAccount}
