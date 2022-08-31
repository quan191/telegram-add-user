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
  for (let i=0; i < group.length; i++){
    if ( group[i].entity.title === "Bố Nhà Cái") {
        console.log(group[i]);
    };
}
  const data = await getData();
  await addToChannel("Bố Nhà Cái", data, client);
  await updateDb(data);
  console.log("You should now be connected");
  console.log(client.session.save());
};

const getData = async () => {
  try {
    let timeNow = Math.floor(Date.now() / 1000); // time is timestamp
    let timeLast = timeNow - 7 * 86400;
    let data = await UsersDatabase.find({
      status: "new user",
      timestamp: {
        $gte: timeLast,
        $lte: timeNow,
      },
      userName: {$ne: null},
    }).limit(50);
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
        channel: channelName,
        users: user,
      })
    );
    console.log(result);
  } catch (err) {
    console.log(err);
  }
};

test();
