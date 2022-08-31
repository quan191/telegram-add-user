require("dotenv").config();
const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
const mongoose = require("mongoose");
const UsersDatabase = require("../databases/users");
mongoose.connect(process.env.MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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
  const group = await client.getDialogs({});
  let x ;
  for (let i=0; i < group.length; i++){
    if ( group[i].entity.title === "Peaky Blinder") {
        x = group[i];
        console.log(x);
    };
}
  const data = await getData();
  await addToChannel(x, data, client);
  await updateDb(data);
  console.log("You should now be connected");
  console.log(client.session.save());
};

const getData = async () => {
  try {
    let data = await UsersDatabase.find({
      status: "new user",
      userName: {$ne: null},
    }).limit(1000);
    let userData = [];
    for (let i=0; i< data.length; i++){
            userData = [... userData, data[i].userName];
    }
    return userData;
  } catch (err) {
    console.log(err);
  }
};

const updateDb = async (data) => {
  try {
    for (let i = 0; i < data.length; i++) {
      await UsersDatabase.findOneAndUpdate(
        { userName: data[i] },
        { status: "added" },
        {
          setDefaultsOnInsert: true,
        }
      );
    }
  } catch (err) {
    console.log(err);
  }
};

const addToChannel = async (channelName, user, client) => {
  console.log("add user");
  try {
    const result = await client.invoke(
      new Api.channels.InviteToChannel({
        entity: channelName,
        users: user,
      })
    );
  } catch (err) {
    console.log(err);
  }
};

test();
