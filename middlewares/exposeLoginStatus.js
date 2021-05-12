module.exports = function exposeLoginStatus(req, res, next) {
  if (!req.session.currentUser) {
    // ----- NO CURRENT USER = ------ //
    // ----- when response is given in locals aka site, it will match a no user privileges  ------ //
    res.locals.currentUser = undefined;
    res.locals.isLoggedIn = false;
    res.locals.isAdmin = false;
  } else {
    // ----- CURRENT USER = ------ //
    // ----- when response is given in locals aka site, it will match a user privileges  ------ //
    res.locals.currentUser = req.session.currentUser;
    res.locals.isLoggedIn = true;
    res.locals.isAdmin = req.session.currentUser.role === "admin"; // true or false
  }
  next();
};