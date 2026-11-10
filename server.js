const express = require("express");
const path = require("path");

const app = express();

// Eu coloquei os codigos que estavam aqui nos respectivos arquivos js, e melhor para alterar no meu ponto de vista

const PUBLICA = __dirname;

app.use("/css", express.static(path.join(PUBLICA, "css")));
app.use("/js", express.static(path.join(PUBLICA, "js")));
app.use("/screens", express.static(path.join(PUBLICA, "screens")));

app.get("/{*rota}", (req, res) => {
    if (path.extname(req.path)) {
        return res.sendStatus(404);
    }
    res.sendFile(path.join(PUBLICA, "index.html"));
});

app.listen(3000, () => console.log("http://localhost:3000"));