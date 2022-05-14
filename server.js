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

  // set up multer for upload file
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

  // upload file and calculate result
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

        // set the first line to N:0,0
        if (i === 0) {
          obj.input = data[0];
          obj.dir = "N";
          obj.x = 0;
          obj.y = 0;
          result.push(obj);
          continue;
        }

        // set input (R, L, F)
        obj.input = data[i];

        // set x,y when input F
        if (data[i] === "F") {
          // E, W are affect to X axis
          obj.x =
            obj.dir === "E" // if E is mean x increase 1 (move)
              ? obj.x + 1 // x + 1
              : obj.dir === "W" // if W is mean x decrease 1 (move)
              ? obj.x === 0 // before decrease x check x is 0 or not
                ? obj.x // if x equal 0, x = x is mean x = 0
                : obj.x - 1 // if x not equal 0 then x decrease 1
              : obj.x; // it means not E and W then not affect to y

          // N, WS are affect to Y axis
          obj.y =
            obj.dir === "N" // if N is mean y increase 1 (move)
              ? obj.y + 1 // y + 1
              : obj.dir === "S" // if S is mean x decrease 1 (move)
              ? obj.y === 0 // before decrease y check y is 0 or not
                ? obj.y // if y equal 0, y = y is mean y = 0
                : obj.y - 1 // if y not equal 0 then y decrease 1
              : obj.y; // it means not N and S then no affect to y
        } else {
          // set direction
          if (direction.indexOf(obj.dir) === 0 && data[i] === "L") { // when currenct direction is N and input is L then set direction to W
            obj.dir = "W";
          } else if (
            direction.indexOf(obj.dir) === direction.length - 1 &&
            data[i] === "R" 
          ) { // when currenct direction is W and input is R then set direction to N
            obj.dir = "N";
          } else {
            // set direction
            obj.dir =
              data[i] === "R"
                ? direction[direction.indexOf(obj.dir) + 1]
                : direction[direction.indexOf(obj.dir) - 1];
          }
        }
        
        // add result
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
