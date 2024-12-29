require("dotenv").config();
const express = require("express");
const cors = require("cors");
const whiteboardRoutes = require("./routes/whiteboardRoutes");
const cardRoutes = require("./routes/cardRoutes");

const app = express();

// cors middleware to allow cross-origin requests
app.use(
  cors({
    origin: "http://localhost:5173", // frontend server port
    methods: "GET,POST,PUT,DELETE,PATCH",
    credentials: true,
  })
);

app.use(express.json());

// 調試 whiteboard 路由

app.use("/api/whiteboards", whiteboardRoutes);
//app.use("/api/cards", cardRoutes);
app.use("/api/cards", cardRoutes);


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

