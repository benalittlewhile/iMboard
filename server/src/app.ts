import express from "express";
import path from "path";
import { resourceLimits } from "worker_threads";
import registerExitHandler from "./lib/conf/exitHandler";
import { initBlankDb } from "./lib/conf/initDb";
import { addRow, findHash, retrieveAllRows } from "./lib/dbMethods";
import { testInsert } from "./lib/demo/dbTest";
import { hash } from "./lib/hash";
import { usesRow } from "./lib/types";

let adminKey: string;

process.argv.map((arg) => {
  if (arg.includes("adminKey")) {
    adminKey = arg.split("adminKey=")[1];
  }
});

const app = express();

// const db = initDb();
const db = initBlankDb();

registerExitHandler(db);

testInsert(db);

const validIds = [0, 1, 69, 8, 24, 305];

app.get("/", (req, res) => {
  // TODO: default page
  res.send("not for you");
});

// routes

/*
writeMessage:
@methods: POST
@params:
  hash:
    string 
    same unique id
@returns
response code
  good if the hash is valid and the db call worked (then client moves on to the
  message list via redirect
  bad if the hash is invalid or the db call fails

*/

/*
getMessages:
@methods: GET
@params: 
  hash:
    string
  only usable once, so before responding this route needs to mark the hash as 
  used in the database
@returns:
  if the hash is valid, return a json list of all the messages in the db
  if the hash is invalid, super don't do that
*/

app.use(express.static(path.join(__dirname, "/public")));

/*
adminHashAndAdd
@methods: post
@params: 
  adminKey: a permanent hashed passphrase I'll need to make and pass as a var and store
  elsewhere
  value: the name or word I want to hash and add
@returns:
  status: 200 if it added
  hash: the hashed value, so I can add it
*/
app.post("/adminHashAndAdd", (req, res) => {
  if (req.query.adminKey !== adminKey) {
    res.status(404).send(`Invalid request`);
  } else if (req.query.adminKey === adminKey) {
    const input = req.query.value as string;
    const output = hash(input);
    addRow(db, output);
    res.status(200).json({
      status: "ok",
      hash: output,
    });
  }
});

/*
adminRetrieve
@methods: GET
@params:
  adminKey: same hashed passphrase as above
@returns:
  a json list of all the hashes and their statuses
    - is there a db function to get this?
    a: haha not a good one
*/
app.get("/adminRetrieve", (req, res) => {
  if (req.query.adminKey !== adminKey) {
    res.status(404).send(`Invalid request`);
  } else if (req.query.adminKey === adminKey) {
    const rows = retrieveAllRows(db, (rows: usesRow[]) => {
      console.log(`retrieved rows: ${JSON.stringify(rows)}`);
      res.status(200).json(rows);
    });
  }
});

/*
/[hash]
@methods: GET
@params:
  hash:
    string
    unique id checking that the request is using one of several verifiable
    signatures stored  in the db
@returns:
  if hash is valid returns the writing page (which needs to also internally
  include the hash in the write request). Don't mark the db at this point.
  if hash is not valid, either bounce to the error/home page or deny the request
*/
app.get("/:id", (req, res) => {
  findHash(db, req.params.id, (result: usesRow[]) => {
    if (result.length > 0) {
      result.map((row: usesRow) => {
        if (row.hash == req.params.id) {
          console.log(`Login from ${req.params.id} on /:id`);
          res.redirect(`/${req.params.id}/write`);
        }
      });
    }
    res.send("not for you");
    // if (validIds.includes(Number(req.params.id))) {
    // } else {
    //   res.send("not for you");
    // }
  });
});

app.get("/:id/write", (req, res) => {
  if (validIds.includes(Number(req.params.id))) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  } else {
    res.send("not for you");
  }
  console.log(`Login from ${req.params.id} on /write`);
});

app.listen(3000, () => {
  console.log("server listening on 3000");
});
