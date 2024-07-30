const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const noteSchema = new Schema({
  title: String,
  content: String,
  id: Number,
});

module.exports = mongoose.model("notes", noteSchema);
