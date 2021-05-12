const express = require("express");
const router = new express.Router();
const ArtistModel = require("./../model/Artist");
const uploader = require("./../config/cloudinary");
const protectAdminRoute = require("./../middlewares/protectAdminRoute");
const StyleModel = require("./../model/Style");
const protectRoute = require("./../middlewares/protectRoute")

// router.use(protectAdminRoute);

// GET - all artists
router.get("/", async (req, res, next) => {
  try {
    res.render("dashboard/artists", { artists: await ArtistModel.find() });
  } catch (err) {
    next(err);
  }
});

// GET - create one artist (form)
// ----------- you have to be sign in to add artist ------------------------ //
router.get("/create", protectRoute, (req, res, next) => {
  StyleModel.find()
    .then((styles) => {
      res.render("dashboard/artistCreate", { styles });
    })
    .catch(next);
});

// GET - update one artist (form)
router.get("/update/:id", async (req, res, next) => {
  try {
    res.render("dashboard/artistUpdate", {
      artist: await ArtistModel.findById(req.params.id).populate("styles"),
      styles: await StyleModel.find(),
    });
  } catch (err) {
    next(err);
  }
});

// GET - delete one artist
router.get("/delete/:id", async (req, res, next) => {
  try {
    await ArtistModel.findByIdAndRemove(req.params.id);
    res.redirect("/dashboard/artist");
  } catch (err) {
    next(err);
  }
});

// POST - create one artist
router.post("/", uploader.single("picture"), async (req, res, next) => {
  const newArtist = { ...req.body };

  if (!req.file) newArtist.picture = undefined;
  else newArtist.picture = req.file.path;
  newArtist.isBand = req.body.isBand === "on";

  try {
    await ArtistModel.create(newArtist);
    res.redirect("/dashboard/artist");
  } catch (err) {
    next(err);
  }
});

// POST - update one artist
router.post("/:id", uploader.single("picture"), async (req, res, next) => {
  try {
    const artistToUpdate = { ...req.body };
    if (req.file) artistToUpdate.picture = req.file.path;
    artistToUpdate.isBand = req.body.isBand === "on";

    await ArtistModel.findByIdAndUpdate(req.params.id, artistToUpdate);
    res.redirect("/dashboard/artist");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
