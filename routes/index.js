const express = require("express");
const router = express.Router();
const db = require("../config/database");
const fs = require("fs");
const multer = require("multer");
var storage = multer.diskStorage({
  destination: "./public/images",
  filename: function(req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post("/login", (req, res) => {
  db.login(req.body).then(result => {
    if (result) {
      res.send(result);
    } else {
      res.send({ login: "null" });
    }
  });
});

router.post("/register", (req, res) => {
  db.register(req.body);
  res.send("Registado com sucesso");
});

router.get("/data", (req, res) => {
  db.getData().then(results => res.send(results));
});

router.get("/mapa", (req, res) => {
  db.getMapa().then(results => res.send(results));
});

router.post("/caop", (req, res) => {
  var local = req.body.local.replace(/ç|ã|á/g, "_");
  local = local.toLowerCase();
  db.getCaop(local).then(results => res.send(results));
});

router.post("/buffer", (req, res) => {
  db.getBuffer(req.body.raio).then(results => res.send(results));
});

router.post("/marker", (req, res) => {
  db.addMarker(req.body.marker);
  res.send("Marker added successfully");
});

router.post("/line", (req, res) => {
  db.addLine(req.body.line);
  res.send("Line added successfully");
});

router.post("/polygon", (req, res) => {
  db.addPolygon(req.body.polygon);
  res.send("Polygon added successfully");
});

router.post("/image", upload.single("imagem"), (req, res) => {
  return res.json("images/" + req.file.filename);
});

router.delete("/delete", (req, res) => {
  if (req.body.path !== "default.png") {
    fs.unlink("public\\" + req.body.path, err => {
      if (err) {
        throw err;
      }
    });
  }
  db.delete(req.body.id);
});

module.exports = router;
