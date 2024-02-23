const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema({
  comments: String,
})

commentSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Comments,  commentSchema")