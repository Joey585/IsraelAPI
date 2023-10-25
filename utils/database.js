const {MongoClient} = require("mongodb");
const User = require("../models/User");
const {isAdmin} = require("./security");

async function connect(uri, collection){
    const client = new MongoClient(uri);
    await client.connect();
    return client.db("israelpalestine").collection(collection);
}

async function createUserID(uri){
    const collection = await connect(uri, "users");
    let id = Math.round(Math.random() * 99999999) + 10000000

    while (await collection.findOne({id: id})){
        id = Math.round(Math.random() * 99999999) + 10000000;
    }

    return id;
}

const getUserData = (token, id) => new Promise(async (resolve, reject) => {
    const admin = await isAdmin(token);
    const rawData = await User.findOne({id: id});
    let userData;

    if(!rawData) return reject("No user");

    switch (admin) {
        case true:
            userData = rawData;
            break;
        case false:
            userData = {
                username: rawData.username,
                id: rawData.id,
                avatarURL: rawData.avatarURL,
                aboutMe: rawData.aboutMe,
                dateJoined: rawData.dateJoined,
            }
            break;
    }

    resolve(userData);
});

const userExists = (username) => new Promise(async (resolve, reject) => {
    const user = await User.findOne({username: username})

    if(user) {
        resolve(true)
    } else {
        resolve(false)
    }
});


module.exports = { connect, createUserID, getUserData, userExists }
