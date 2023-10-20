const {MongoClient} = require("mongodb");


async function connect(uri, collection){
    const client = new MongoClient(uri);
    await client.connect();
    return client.db("israelpalestine").collection(collection);
}


module.exports = { connect }
