const mongoose = require("mongoose");
const Schema = new mongoose.Schema({
    firstName: {type: String, default: null},
    lastName: {type: String, default: null},
    userName: {type: String, default: null},
    phone: {type: Number, default: null},
    status: {type: String, default: "new user"},
});

module.exports = mongoose.model("Users", Schema);
