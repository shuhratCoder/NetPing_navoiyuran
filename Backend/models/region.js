const mongoose = require("mongoose");

const regionSchema = new mongoose.Schema({
  region: { type: String ,required: true}
});

module.exports=mongoose.model("Region",regionSchema)
