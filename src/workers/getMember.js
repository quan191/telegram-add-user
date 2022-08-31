require('dotenv').config();
const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
const mongoose = require('mongoose');
const UsersDatabase = require("../databases/users");
mongoose.connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

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
    await pushToDb(userData);
    console.log("You should now be connected");
    console.log(client.session.save());

};
const getGroup = async (client) =>{
    console.log("load group chat");
    let chat = [];
    let group = [];
    const result = await client.getDialogs({});
    return result;
}
const getParticipants = async (client, group) => {
    console.log("load participant of group chat");
    const result = await client.getParticipants(group, {});
    return result;
}

const pushToDb = async (data) => {
    try{
        for (let i = 0; i< data.length; i++){
            let insert = {
                firstName: data[i].firstName,
                lastName: data[i].lastName,
                userName: data[i].username,
                phone: data[i].phone,
            }
            await UsersDatabase.findOneAndUpdate({userName: insert.userName}, insert, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            });
        }
    } catch(err){
        console.log(err);
    }
}
function isVietnamesePhoneNumberValid(number) {
    return /(((\+|)84)|0)(3|5|7|8|9)+([0-9]{8})\b/.test(number);
  }

test(); 
