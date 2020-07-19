let express = require("express");
let bodyParser = require("body-parser");
let mongoose = require("mongoose");
let methodOverride = require("method-override");
let Product = require("./models/products");
let Inventory = require("./models/inventory");
let app = express();
let passport = require("passport"),
  localStrategy = require("passport-local"),
  User = require("./models/user");
let flash = require("connect-flash");
let middleware = require("./middleware");
let seedDB = require("./seeds");
// seedDB();
app.use(methodOverride("_method"));
app.use(flash());
app.use(
  require("express-session")({
    secret: "Jason is a good developer",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(bodyParser.urlencoded({ extended: true }));
mongoose
  .connect(
    "mongodb+srv://jason2004:sharma2004@cluster0.ugnh0.mongodb.net/kapa?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    }
  )
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log("ERROR: ", err.message);
  });

app.set("view engine", "ejs");
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});
//landing route
app.get("/", function (req, res) {
  res.render("landing");
});

//index route
app.get("/index", function (req, res) {
  Product.find({}, function (err, allProducts) {
    if (err) {
      console.log(err);
    } else {
      res.render("index", {
        products: allProducts,
      });
    }
  });
});
//create new inventory
app.post("/index", middleware.isLoggedIn, function (req, res) {
  const author = {
    id: req.user.id,
    username: req.user.username,
  };
  const newInventory = {
    author: author,
  };

  Inventory.create(newInventory, function (err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/index");
    }
  });
});
//Adding to inventory
app.post("/index/:id/inventory", function (req, res) {
  Inventory.findById(req.body.inventory.id, function (err, foundInventory) {
    if (err) {
      console.log(err);
    } else {
      Product.findById(req.params.id, function (err, foundProduct) {
        if (err) {
          console.log(err);
        } else {
          foundInventory.products.push(foundProduct);
          foundInventory.save();
          res.redirect("/index/" + foundProduct._id);
        }
      });
    }
  });
});

app.get("/index/:id", function (req, res) {
  Product.findById(req.params.id, function (err, foundProduct) {
    Inventory.find({}, function (err, allInventories) {
      if (err) {
        console.log(err);
      } else {
        res.render("show", {
          product: foundProduct,
          inventories: allInventories,
        });
      }
    });
  });
});
app.get("/inventory", function (req, res) {
  Inventory.find({}, function (err, allInventories) {
    if (err) {
      console.log(err);
    } else {
      res.render("path", {
        inventories: allInventories,
      });
    }
  });
});
app.get("/inventory/:id", function (req, res) {
  Inventory.findById(req.params.id)
    .populate("products")
    .exec(function (err, foundInventory) {
      if (err) return handleError(err);
      else {
        res.render("inventory", { inventory: foundInventory });
      }
    });
});
app.get("/inventory/:id/edit", middleware.checkInventoryOwnership, function (
  req,
  res
) {
  Inventory.findById(req.params.id, function (err, foundInventory) {
    if (err) {
      console.log(err);
    } else {
      res.render("edit", { inventory: foundInventory });
    }
  });
});
app.put("/inventory/:id", function (req, res) {
  Inventory.findByIdAndUpdate();
});
// app.get("/inventory/:id/purchase", function (req, res) {

// });

app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/register", function (req, res) {
  res.render("register");
});
app.post("/register", function (req, res) {
  let newUser = new User({ username: req.body.username });
  User.register(newUser, req.body.password, function (err, user) {
    {
      if (err) {
        return res.render("register", { error: err.message });
      }
      passport.authenticate("local")(req, res, function () {
        req.flash("success", "Welcome to YelpCamp " + user.username);
        res.redirect("/index");
      });
    }
  });
});
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/index",
    failureRedirect: "/login",
  }),
  function (req, res) {}
);
app.get("/logout", function (req, res) {
  req.logout();
  req.flash("success", "Logged you out");
  res.redirect("/index");
});
//Middleware

app.listen("3000", function () {
  console.log("Server Started");
});
