const axios = require("axios");
const database = require("./database");
const config = require("../config.json");

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

const verifyUser = (accessToken) => new Promise(async (resolve, reject) => {
    const collection = await database.connect(config.mongoURI, "config");
    const users = await collection.findOne({id: "authed-users"});
    console.log("Ran with " + accessToken)
    axios.get("https://discord.com/api/users/@me", {headers: {Authorization: `Bearer ${accessToken}`}}).then((res) => {
        console.log(res.data.id)
        if(users.users.indexOf(res.data.id) !== -1){
            resolve({code: 200, user: res.data})
        } else {
            resolve({code: 400, username: res.data.username})
        }
    }).catch((e) => {
        console.log(e)
        reject(e);
    });
});

module.exports = {getAccessToken, verifyUser}
