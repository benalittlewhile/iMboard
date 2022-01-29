import express from "express";
import path from "path";
import { resourceLimits } from "worker_threads";
import registerExitHandler from "./lib/conf/exitHandler";
import initDb, { initBlankDb } from "./lib/conf/initDb";
import {
  addMessageRow,
  addUsesRow,
  findHash,
  getMessages,
  retrieveAllRows,
} from "./lib/dbMethods";
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
app.use(express.json());

// const db = initDb();
const db = initBlankDb();
testInsert(db); // necessary for blank start, else there's no hash to test with

registerExitHandler(db);

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
  console.log("[POST/adminHashAndAdd]");
  if (req.query.adminKey !== adminKey) {
    res.status(404).send(`Invalid request`);
  } else if (req.query.adminKey === adminKey) {
    const input = req.query.value as string;
    const output = hash(input);
    addUsesRow(db, output);
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
  console.log("[GET/adminRetrieve]");
  if (req.query.adminKey !== adminKey) {
    res.status(404).send(`Invalid request`);
  } else if (req.query.adminKey === adminKey) {
    retrieveAllRows(db, (rows: usesRow[]) => {
      console.log(`retrieved rows: ${JSON.stringify(rows)}`);
      res.status(200).json(rows);
    });
  }
});

app.get("/write", (req, res) => {
  console.log("[GET/write]");
  const hash = req.query.hash as string;
  if (hash) {
    console.log(`[GET/write] with hash: ${hash}`);
    findHash(db, hash, (result: usesRow[]) => {
      if (result.length != 0) {
        result.map((row: usesRow) => {
          if (row.hash === hash) {
            console.log(`[GET/write] verified hash`);
            res
              .status(200)
              .sendFile(path.join(__dirname, "public", "index.html"));
          }
        });
      } else {
        console.log("[GET/write] rejected hash");
        res.status(404).send("Invalid request");
      }
    });
  }
});

app.post("/write", (req, res) => {
  console.log("[POST/write]");
  const hash = req.query.hash as string;
  if (hash) {
    console.log(`[POST/write] with hash: ${hash}`);
    findHash(db, hash, (result: usesRow[]) => {
      if (result.length != 0) {
        const row = result[0];
        if (row.hash === hash) {
          console.log(`[POST/write] verified hash`);
          console.log(`[POST/write] got message body: ${req.body.message}`);
          addMessageRow(db, req.body.message);
          res.status(200).send();
          return;
        }
      } else {
        console.log("[POST/write] rejected hash");
        res.status(404).send("Invalid request");
      }
    });
  }
});

app.get("/getMessages", (req, res) => {
  console.log("[/getMessages]");
  const hash = req.query.hash as string;
  if (hash) {
    console.log(`[GET/getMessages] with hash: ${hash}`);
    findHash(db, hash, (result: usesRow[]) => {
      if (result.length != 0) {
        result.map((row: usesRow) => {
          if (row.hash === hash) {
            console.log(`[GET/getMessages] verified hash`);
            getMessages(db, (rows: usesRow[]) => {
              if (!res.headersSent) {
                console.log("[GET/getMessages] valid res, sending");
                res.status(200).send(rows);
              } else {
                return;
              }
            });
          }
        });
      }
    });
  }
});

app.get("/read", (req, res) => {
  console.log(["/read"]);
  const hash = req.query.hash as string;
  if (hash) {
    console.log(`[GET/read] with hash: ${hash}`);
    findHash(db, hash, (result: usesRow[]) => {
      if (result.length != 0) {
        result.map((row: usesRow) => {
          if (row.hash === hash) {
            console.log(`[GET/read] verified hash`);
            res
              .status(200)
              .sendFile(path.join(__dirname, "public", "index.html"));
          }
        });
      } else {
        console.log("[GET/read] rejected hash");
        res.status(404).send("Invalid request");
      }
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
  console.log("wildcard messed you up again");
  findHash(db, req.params.id, (result: usesRow[]) => {
    if (result.length > 0) {
      res.status(200).redirect(`/write?hash=${req.params.id}`);
    } else {
      res.send("not for you");
    }
    // if (validIds.includes(Number(req.params.id))) {
    // } else {
    //   res.send("not for you");
    // }
  });
});

app.listen(3000, () => {
  console.log("server listening on 3000");
});
