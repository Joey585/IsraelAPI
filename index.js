const express = require("express");
const database = require("./utils/database");
const app = express();
const config = require("./config.json");
const {getAccessToken, verifyUser} = require("./utils/discord");
const bodyParser = require('body-parser');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

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

   verifyUser(accessToken).then((data) => {
        res.json(data)
   }).catch((e) => {
        next(e)
   })
});

app.listen(9585, () => {
    console.log("API Online")
})
