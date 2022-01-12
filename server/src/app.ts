import express from "express";
import path from "path";

const app = express();

const validIds = [0, 1, 69, 8, 24, 305];

app.get("/", (req, res) => {
  res.send("not for you");
});

app.use(express.static(path.join(__dirname, "/public")));

app.get("/:id", (req, res) => {
  if (validIds.includes(Number(req.params.id))) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  } else {
    res.send("not for you");
  }
  console.log(`Login from ${req.params.id}`);
});

app.listen(3000, () => {
  console.log("server listening on 3000");
});
