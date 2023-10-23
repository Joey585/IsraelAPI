const {MongoClient} = require("mongodb");


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


module.exports = { connect, createUserID }
