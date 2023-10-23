function createTokenFromDiscord(id){
    return `${Buffer.from(id).toString("base64")}.${Buffer.from(Date.now()).toString("base64")}.${Buffer.from(Math.floor(Math.random() * 99999) + 10000)}`;
}

module.exports = {createTokenFromDiscord}