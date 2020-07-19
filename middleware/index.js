let Inventory = require("../models/inventory");
let Product = require("../models/products");
let middlewareObj = {};
middlewareObj.checkInventoryOwnership = function (req, res, next) {
  if (req.isAuthenticated()) {
    Inventory.findById(req.params.id, function (err, foundInventory) {
      if (err) {
        res.redirect("back");
      } else {
        if (foundInventory.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You dont have permission to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You dont have permission to do that");
    res.redirect("back");
  }
};
middlewareObj.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "Please login first");
  res.redirect("/login");
};
module.exports = middlewareObj;
