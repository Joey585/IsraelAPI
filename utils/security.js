const User = require("../models/User");
const {response} = require("express");

function createTokenFromDiscord(id){
    return `${Buffer.from(id.toString()).toString("base64")}.${Buffer.from(Date.now().toString()).toString("base64")}.${Buffer.from((Math.floor(Math.random() * 99999) + 10000).toString()).toString("base64")}`;
}

const isAdmin = (token) => new Promise(async (resolve, reject) => {
    const user = await User.findOne({token: token});
    if(user.admin){resolve(true)}
    else {resolve(false)}
});

const validToken = (token) => new Promise(async (resolve, reject) => {
    const user = await User.findOne({token: token});
    if(!user) {
        resolve(false)
    } else {
        resolve(true)
    }
});

module.exports = {createTokenFromDiscord, isAdmin, validToken}
