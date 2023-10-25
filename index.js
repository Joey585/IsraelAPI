const express = require("express");
const database = require("./utils/database");
const app = express();
const config = require("./config.json");
const {getAccessToken, verifyUser, createAccount} = require("./utils/discord");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const {validToken} = require("./utils/security");
const {getUserData} = require("./utils/database");
const cors = require("cors")

async function checkUser(req, res, next) {
    const nonSecurePaths = ['/', '/oauth2', '/auth', '/verify'];
    if(nonSecurePaths.includes(req.path)) return next();

    if(!req.get("Authorization")) return res.status(403).json({error: "No token"});
    if(!await validToken(req.get("Authorization"))) return res.status(403).json({error: "Token is invalid"});
    next();
}

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.use(cors());
app.options("*", cors())
app.all("*", checkUser);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Credentials', 'true')
    next();
});

app.get("/oauth2", async (req, res) => {
    const type = req.query.type;
    const collection = await database.connect(config.mongoURI, "config");
    switch (type) {
        case "local":
            collection.findOne({id: "oauth2-link"}).then((doc) => {res.json({d: doc.linkLocal})})
            break;
        case "external":
            collection.findOne({id: "oauth2-link"}).then((doc) => {res.json({d: doc.linkExternal})})
            break;
        default:
            res.json({d: "Malformed Request"})
    }
});

app.post("/auth", async (req, res, next) => {
    const code = req.body.code;
    const local = req.body.local;
    if(!code || !local) return res.sendStatus(400);

    getAccessToken(code, local).then((discord) => {
        console.log("Ran Correctly")
        res.json(discord);
    }).catch((e) => {
        console.log("Error!");
        next(e)
    });
});

app.get("/verify", async (req, res, next) => {
   const accessToken = req.query.accessToken;

   if(!accessToken) return res.sendStatus(400);

   createAccount(accessToken).then((token) => {
      res.json({code: 200, token: token});
   }).catch((e) => {
       next(e);
   });
});

app.get("/user", async (req, res, next) => {
    if(!req.query.id) return;
    const token = req.get("Authorization");

    getUserData(token, req.query.id).then((data) => {
        res.json(data);
    }).catch((e) => {
        next(e);
    })
});

app.listen(9585, () => {
    console.log("API Online")
});

mongoose.connect(config.mongoURI);

