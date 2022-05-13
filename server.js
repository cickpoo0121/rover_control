const express = require("express");
const next = require("next");

const port = 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  const bodyParser = require("body-parser");
  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(bodyParser.json());

  const multer = require("multer");
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/uploads");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "_" + file.originalname);
    },
  });

  const upload = multer({ storage: storage });

  server.get("/hi", (req, res) => {
    return res.json({ msg: "hi" });
  });

  server.post("/uploadExcel", upload.single("files"), (req, res, next) => {
    const file = req.file;
    console.log(req.file);
    if (!file) {
      res.status(500).send({ msg: "Internal server error" });
      return;
    }
    res.status(200).send({ msg: "Upload successfuly" });
  });

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
