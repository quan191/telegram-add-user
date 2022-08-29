require('dotenv').config();
const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const converter = require('json-2-csv');
console.log(converter);
const fs = require('fs');
const input = require("input");

console.log(process.env.API_ID);
const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession("");

const test = async () => {
    console.log("Loading interactive example ...");
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });
    await client.start({
        phoneNumber: async () => await input.text("Please enter your number: "),
        pasword: async () => await input.text("Please enter your password: "),
        phoneCode: async () =>
            await input.text("Please enter the code you received: "),
        onError: (err) => console.log(err),
    });
    const result = await getGroup(client);
    let group;
    for (let i=0; i < result.length; i++){
        if ( result[i].entity.title === "Piratera NFT Gaming Group") {
            group = result[i];
        };
    }
    console.log(group);
    const user = await getParticipants(client, group);
    let userData = [];
    let x ;
    for (let i=0; i < user.length; i++){
        if (user[i].username !== null){
            userData = [... userData, user[i].username];
        }
    }
    console.log(userData);
    await addToChannel("W88 NHÀ CÁI UY TÍN ĐẾN TỪ CHÂU ÂU", userData, client);
    console.log("You should now be connected");
    console.log(client.session.save());

};
const getGroup = async (client) =>{
    console.log("load group chat");
    let chat = [];
    let group = [];
    const result = await client.getDialogs({
        title: "VRF-Orai-Report",
    });
    return result;
}
const getParticipants = async (client, group) => {
    console.log("load participant of group chat");
    const result = await client.getParticipants(group, {});
    return result;
}

const addToChannel = async (channelName, user, client) => {
    const result = await client.invoke(new Api.channels.InviteToChannel({
        channel: channelName,
        users: user,
    }));
    console.log(result);
}

test(); 
