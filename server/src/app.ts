import express from "express";
import path from "path";

const app = express();

// app.get("/favicon.ico", (req, res) => res.status(204));
app.use(express.static(path.join(__dirname, "/public")));

const validIds = [0, 1, 69, 8, 24, 305];

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
