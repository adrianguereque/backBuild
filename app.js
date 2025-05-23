require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');  

const {swaggerUi, specs} = require("./docs/swagger"); 
const userRoutes = require("./routes/users");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://adrianguereque.github.io"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
};


app.use(cookieParser()); 

app.use(express.json());
app.use(cors(corsOptions));

app.use("/users", userRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs)); 

module.exports = app;