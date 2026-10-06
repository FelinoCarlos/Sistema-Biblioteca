const express = require("express");
const path = require("path");

const app = express();

app.use("/Static", express.static(path.resolve(__dirname,"static")));

app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "index.html"));
});

app.get("/catalogo", (req, res) => {
    res.sendFile(path.resolve(__dirname, "catalogo.html"));
});


app.listen(process.env.PORT || 5000, () => console.log("Server is running..."));