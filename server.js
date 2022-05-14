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

        // set position x,y
        if (data[i][0] === "F" || data[i][0] === "B") {
          obj = moving(data[i], obj, parseInt(data[0]));
        } else {
          // set direction
          obj = turning(data[i], obj, direction);
        }

        // add result
        result.push(obj);
      }
      res.status(200).send({ msg: "Upload successfuly", data: result });
    });
  });

  /**
   * moving function
   * @param {string} input - input data (R, L, F, B)
   * @param {Object} obj - object of last input and output
   * @param {number} block - area of map I assume is square area (block*block)
   */
  moving = (input, obj, block) => {
    // E, W are affect to X axis
    // N, WS are affect to Y axis
    let area = block * block;
    let step = input.length > 1 ? parseInt(input.split("")[1]) : 1;
    input = input.split("")[0];

    obj.x =
      obj.dir === (input === "F" ? "E" : "W")
        ? obj.x + step
        : obj.dir === (input === "F" ? "W" : "E")
        ? obj.x <= 0
          ? obj.x
          : obj.x - step
        : obj.x;

    obj.y =
      obj.dir === (input === "F" ? "N" : "S")
        ? obj.y + step
        : obj.dir === (input === "F" ? "S" : "N")
        ? obj.y <= 0
          ? obj.y
          : obj.y - step
        : obj.y;

    if (obj.x > area) {
      obj.x = area;
    }

    if (obj.y > area) {
      obj.y = area;
    }

    return obj;
  };

  /**
   * turning function
   * @param {string} input - input data (R, L, F, B)
   * @param {Object} obj - object of last input and output
   * @param {string[]} direction - direction
   */
  turning = (input, obj, direction) => {
    if (direction.indexOf(obj.dir) === 0 && input === "L") {
      obj.dir = "W";
    } else if (
      direction.indexOf(obj.dir) === direction.length - 1 &&
      input === "R"
    ) {
      obj.dir = "N";
    } else {
      obj.dir =
        input === "R"
          ? direction[direction.indexOf(obj.dir) + 1]
          : direction[direction.indexOf(obj.dir) - 1];
    }

    return obj;
  };

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
