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
    const user = await getParticipants(client, group);
    let userData = [];
    let x ;
    for (let i=0; i < user.length; i++){
        x= {
            firstName: user[i].firstName,
            lastName: user[i].lastName,
            username: user[i].username,
            phone: user[i].phone,
        };
        userData = [... userData, x];
    }
    console.log(userData);
    await convertCSV(userData);
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

const convertCSV = async (data) => {
    console.log(converter);
    converter.json2csv(data, (err, csv) => {
        if (err) {
            throw err;
        }
    
        // print CSV string
        console.log(csv);
    
        // write CSV to a file
        fs.writeFileSync('user.csv', csv);
        
    });
}


test(); 
