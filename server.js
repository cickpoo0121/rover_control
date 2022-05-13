const express = require("express");
const next = require("next");
const readXlsxfile = require("read-excel-file/node");

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

    // not file
    if (!file) {
      res.status(500).send({ msg: "Internal server error" });
      return;
    }

    // read excel
    readXlsxfile(req.file.path).then((row) => {
      var result = [];
      let data = row.toString().split(",");
      const direction = ["N", "E", "S", "W"];

      // mapping excel to object
      for (let i = 0; i < data.length; i++) {
        var obj = i === 0 ? {} : JSON.parse(JSON.stringify(result[i - 1]));

        // set initail
        if (i === 0) {
          obj.input = data[0];
          obj.dir = "N";
          obj.x = 0;
          obj.y = 0;
          result.push(obj);
          continue;
        }

        // set input
        obj.input = data[i];

        // set x,y when input F
        if (data[i] === "F") {
          obj.x =
            obj.dir === "E"
              ? obj.x + 1
              : obj.dir === "W"
              ? obj.x === 0
                ? obj.x
                : obj.x - 1
              : obj.x;

          obj.y =
            obj.dir === "N"
              ? obj.y + 1
              : obj.dir === "S"
              ? obj.y === 0
                ? obj.y
                : obj.y - 1
              : obj.y;
        } else {
          // set direction
          if (direction.indexOf(obj.dir) === 0 && data[i] === "L") {
            obj.dir = "W";
          } else if (
            direction.indexOf(obj.dir) === direction.length - 1 &&
            data[i] === "R"
          ) {
            obj.dir = "N";
          } else {
            obj.dir =
              data[i] === "R"
                ? direction[direction.indexOf(obj.dir) + 1]
                : direction[direction.indexOf(obj.dir) - 1];
          }
        }

        result.push(obj);
      }
      res.status(200).send({ msg: "Upload successfuly", data: result });
    });
  });

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
