let mongoose = require("mongoose");

let productSchema = new mongoose.Schema({
  name: String,
  image: String,
});
module.exports = mongoose.model("Product", productSchema);
