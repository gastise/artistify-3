const express = require("express");
const router = express.Router();
const User = require("./../model/User");
const bcrypt = require("bcrypt"); // lib to encrypt data

//render signin page
router.get("/signin", (req, res, next) => {
  res.render("auth/signin");
});

//render signup page
router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

//leave a session
router.get("/signout", async (req, res, next) => {
  req.session.destroy(function (err) {
    // cannot access session here anymore
    // console.log(req.session.currentUser);
    res.redirect("/auth/signin");
  });
});


//execute the signin process under some conditions 
router.post("/signin", async (req, res, next) => {
  // DO something
  //   res.render("auth/signin.hbs");
  const { email, password } = req.body;
  const foundUser = await User.findOne({ email: email });

  if (!foundUser) {
    //   Display an error message telling the user that either the password
    // or the email is wrong
    req.flash("error", "Invalid credentials");
    res.redirect("/auth/signin");
    // res.render("auth/signin.hbs", { error: "Invalid credentials" });
  } else {
    // https://www.youtube.com/watch?v=O6cmuiTBZVs
    const isSamePassword = bcrypt.compareSync(password, foundUser.password);
    if (!isSamePassword) {
      // Display an error message telling the user that either the password
      // or the email is wrong
      req.flash("error", "Invalid credentials");
      res.redirect("/auth/signin");
      // res.render("auth/signin.hbs", { error: "Invalid credentials" });
    } else {
      // everything is fine so :
      // Authenticate the user...
      const userObject = foundUser.toObject();
      delete userObject.password; // remove password before saving user in session
      // console.log(req.session, "before defining current user");
      req.session.currentUser = userObject; // Stores the user in the session (data server side + a cookie is sent client side)

      // https://www.youtube.com/watch?v=nvaE_HCMimQ
      // https://www.youtube.com/watch?v=OFRjZtYs3wY

      req.flash("success", "Successfully logged in...");
      res.redirect("/profile");
    }
  }
});

//execute the signup process under some conditions 
router.post("/signup", async (req, res, next) => {
  try {
    const newUser = { ...req.body }; // clone req.body with spread operator
    const foundUser = await User.findOne({ email: newUser.email });

    if (foundUser) {
      req.flash("warning", "Email already registered");
      res.redirect("/auth/signup");
    } else {
      const hashedPassword = bcrypt.hashSync(newUser.password, 10);
      // console.log(newUser.password, hashedPassword);
      newUser.password = hashedPassword;
      await User.create(newUser);
      req.flash("success", "Congrats ! You are now registered !");
      res.redirect("/auth/signin");
    }
  } catch (err) {
    let errorMessage = "";
    for (field in err.errors) {
      errorMessage += err.errors[field].message + "\n";
    }
    req.flash("error", errorMessage);
    res.redirect("/auth/signup");
  }
});

module.exports = router;  //_________ WATCH OOOOOOUUT _________ //
