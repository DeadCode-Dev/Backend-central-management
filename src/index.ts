import express from "express";
import cors from "cors";
import multer from "multer";
import Utils from "./Utils/Converter";
import { Phones } from "./Types/Phones";
import mongoose from "mongoose";
import User from "./Schemas/Users";
import XlSX, { writeFileAsync } from "xlsx";
import { emitWarning } from "process";
mongoose
  .connect(
    "mongodb+srv://DeadCode:adMcUufIPNgSkTLs@cluster0.gjqy5ur.mongodb.net/User"
  )
  .then(() => {
    console.log("[DataBase]:- Connected!");
  })
  .catch((e) => {
    console.log("[DataBase]:- Error\n" + e);
  });

const app = express();

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/Downloads");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + file.originalname.slice(file.originalname.lastIndexOf("."))
    );
  },
});

const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require('path');

app.get('/install/:id', (req, res) => {
  const filePath = path.join(__dirname, '/install', req.params.id);
  res.download(filePath);
});

app.get("/users", async (req, res) => {
  try {
    const names = await User.distinct("name");
    res.json(names);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
});

app.post("/get/user", async (req, res) => {
  try {
    const name = req.body.Name;
    const users = await User.find({ name });
    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
});

app.post("/edit/user", async (req, res) => {
  try {
    const promises = req.body.Data.map(async (data: any) => {
      let user = await User.findOne({
        _id: data._id,
      });

      if (!user) {
        await User.create({
          name: data.Name,
          Number: data.Number,
          plan: data.plan,
          date: data.date,
          pay: data.pay,
          dateOfPaid: data.dateOfPaid,
          paid: data.paid,
          comment: data.comment,
          seller: data.seller,
          address: data.address,
          updates: data.updates,
          ID: data.ID,
        });
      } else {
        user.name = data.name;
        user.Number = data.Number;
        user.plan = data.plan;
        user.date = data.date;
        user.pay = data.pay;
        user.dateOfPaid = data.dateOfPaid;
        user.paid = data.paid;
        user.comment = data.comment;
        user.seller = data.seller;
        user.address = data.address;
        user.updates = data.updates;
        user.ID = data.ID;

        await user.save();
      }
    });

    await Promise.all(promises);

    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
});

app.post("/delete/user", async (req, res) => {
  try {
    const name = req.body.name;
    const Number = req.body.Number;
    await User.findOneAndDelete({ name, Number });
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
});

app.post("/upload", upload.single("file"), (req, res) => {
  const Converter = new Utils();
  if (Object.keys(req.body).length !== 12 || !req.file?.originalname) {
    res.sendStatus(403);
    return;
  }
  res.sendStatus(200);
  Converter.ConvertYourOwn(req.file?.path as string, req.body as Phones);
});

app.post("/upload/report", upload.single("file"), (req, res) => {
  const Converter = new Utils();
  if (Object.keys(req.body).length !== 2 || !req.file?.originalname) {
    res.sendStatus(403);
    return;
  }
  res.sendStatus(200);
  Converter.Convert(req.file.path as string, req.body);
});

app.post(
  "/upload/mix",
  upload.fields([
    {
      name: "file",
    },
    {
      name: "file2",
    },
  ]),
  (req, res) => {
    let excel = JSON.parse(req.body.excel);
    let newExcel = JSON.parse(req.body.newexcel);
    let now = Date.now()
    if (!req.files) return;
    let [data, newData] = ConvertToJson(req.files as unknown as Express.Multer.File[][]);

    data = data.map((item: any) => {
      const newDataItem = newData.find((newItem: any) => newItem[newExcel.Number] === item[excel.Number]);
      if (newDataItem) {
        item = { ...item, [excel.Amount]: newDataItem[newExcel.Amount] };
      }
      return item;
    });
    saveToXlsx(data, now)
    res.send(`/install/${now}.xlsx`)
  }
);

function saveToXlsx(data: any, filename: any) {
  const worksheet = XlSX.utils.json_to_sheet(data);
  const workbook = XlSX.utils.book_new();
  XlSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');
  const filePath = `src/install/${filename}.xlsx`;

  XlSX.writeFile(workbook, filePath);
}

function ConvertToJson(files: Express.Multer.File[][]) {
  let Data: any[] = [];
  let newData: any[] = [];

  Object.values(files).forEach((fileArr) => {
    fileArr.forEach((file) => {
      const workbook = XlSX.readFile(file.path);
      const sheetName: string = workbook.SheetNames[0];
      const jsonData: any[] = XlSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      
      if (file.fieldname === "file") {
        Data = jsonData
      } else if (file.fieldname === "file2") {
        newData = jsonData
      }
    });
  });

  return [Data, newData];
}


app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
