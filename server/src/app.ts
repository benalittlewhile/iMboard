import express from "express";
import path from "path";
import https from "https";
import registerExitHandler from "./lib/conf/exitHandler";
import initDb from "./lib/conf/initDb";
import {
  addMessageRow,
  addUsesRow,
  deleteMessageById,
  findHash,
  getMessages,
  markHasRead,
  markHasWritten,
  retrieveAllRows,
} from "./lib/dbMethods";
import { hash } from "./lib/hash";
import { usesRow } from "./lib/types";
import * as fs from "fs";

let adminKey = process.env.ADMINKEY;

if (!adminKey || adminKey == "") {
  console.error("Adminkey unset, exiting");
  process.exit();
}

const app = express();
app.use(express.json());

const db = initDb();
// const db = initBlankDb();
// necessary for blank start, else there's no hash to test with
// testInsert(db);

registerExitHandler(db);

app.get("/", (req, res) => {
  // TODO (maybe): default page
  res.send("not for you");
});

// routes

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
  if (!req.query.adminKey || req.query.adminKey !== adminKey) {
    console.log("[POST/adminHashAndAdd] invalid key, rejecting");
    res.status(404).send(`Invalid request`);
    return;
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
app.get("/adminRetrieveHashes", (req, res) => {
  if (!req.query.adminKey || req.query.adminKey !== adminKey) {
    console.log("[GET/adminRetrieveHashes] invalid key, rejecting");
    res.status(404).send(`Invalid request`);
    return;
  } else if (req.query.adminKey === adminKey) {
    retrieveAllRows(db, (rows: usesRow[]) => {
      console.log(
        `[GET/adminRetrieveHashes] valid key, sending retrieved rows`
      );
      res.status(200).json(rows);
    });
  }
});

/*
adminRetrieveMessages
GET
@params:
  adminkey
return:
  same as GET/read
*/
app.get("/adminRetrieveMessages", (req, res) => {
  if (!req.query.adminKey || req.query.adminKey !== adminKey) {
    console.log(["[GET/adminRetrieveMessages] invalid key, rejecting"]);
    res.status(404).send(`Invalid request`);
  } else if (req.query.adminKey === adminKey) {
    getMessages(db, (rows: usesRow[]) => {
      if (!res.headersSent) {
        console.log("[GET/adminRetrieveMessages] valid key, sending");
        res.status(200).send(rows);
      } else {
        return;
      }
    });
  }
});

app.post("/adminDeleteMessageById", (req, res) => {
  if (!req.query.adminKey || req.query.adminKey !== adminKey) {
    console.log(`[POST/adminDeleteMessageById] no key given, rejecting`);
    res.status(404).send(`Invalid request`);
  } else if (req.query.adminKey === adminKey) {
    console.log(
      `[POST/adminDeleteById] key verified, attempting to delete message with id ${req.query.id}`
    );
    const id = Number(req.query.id);
    deleteMessageById(db, id);
    res.status(200).json({
      status: "ok",
    });
  }
});

app.get("/write", (req, res) => {
  if (!req.query.hash) {
    res.send("not for you");
    console.log(`[GET/write] no hash given, rejecting`);
    return;
  }
  const hash = req.query.hash as string;
  const shortHash = hash.slice(undefined, 8) + "...";
  console.log(`[GET/write] with hash: ${shortHash}`);
  findHash(db, hash, (result: usesRow[]) => {
    if (result.length != 0) {
      result.map((row: usesRow) => {
        if (row.hash === hash) {
          console.log(`[GET/write] verified hash`);
          if (row.has_written == false) {
            console.log(`[GET/write] hash has not written, sending`);
            res
              .status(200)
              .sendFile(path.join(__dirname, "public", "index.html"));
            return;
          } else {
            console.log(`[GET/write] hash has already written, rejecting`);
            res.status(404).send("Invalid request");
          }
        }
      });
    } else {
      console.log(`[GET/write] invalid hash, rejecting`);
      res.status(404).send("Invalid request");
    }
  });
});

/*
Write:
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
app.post("/write", (req, res) => {
  if (!req.query.hash) {
    res.send("not for you");
    console.log("[POST/write] no hash given, rejecting");
    return;
  }
  const hash = req.query.hash as string;
  if (hash) {
    const shortHash = hash.slice(undefined, 8) + "...";
    console.log(`[POST/write] with hash: ${shortHash}`);
    findHash(db, hash, (result: usesRow[]) => {
      if (result.length != 0) {
        const row = result[0];
        if (row.hash === hash) {
          console.log(`[POST/write] verified hash`);
          if (row.has_written == false) {
            console.log(
              `[POST/write] hash has not written, setting and sending`
            );
            console.log(`[POST/write] got message body: ${req.body.message}`);
            addMessageRow(db, req.body.message);
            markHasWritten(db, hash);
            res.status(200).send();
            return;
          } else {
            console.log(
              `[GET/getMessages] hash has already written, rejecting`
            );
            res.status(404).send("Invalid request");
          }
        }
      } else {
        console.log(`[POST/write] rejected hash`);
        res.status(404).send("Invalid request");
      }
    });
  }
});

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
app.get("/getMessages", (req, res) => {
  if (!req.query.hash) {
    res.send("not for you");
    console.log(`[GET/write] no hash given, rejecting`);
    return;
  }
  const hash = req.query.hash as string;
  const shortHash = hash.slice(undefined, 8) + "...";
  console.log(`[GET/getMessages] with hash: ${shortHash}`);
  findHash(db, hash, (result: usesRow[]) => {
    if (result.length != 0) {
      result.map((row: usesRow) => {
        if (row.hash === hash) {
          console.log(`[GET/getMessages] verified hash`);
          if (row.has_read == false) {
            console.log(
              `[GET/getMessages] hash has not read, setting and sending`
            );
            markHasRead(db, hash);
            getMessages(db, (rows: usesRow[]) => {
              if (!res.headersSent) {
                console.log("[GET/getMessages] valid res, sending");
                res.status(200).send(rows);
              } else {
                return;
              }
            });
          } else {
            console.log(`[GET/getMessages] hash has already read, rejecting`);
            res.status(404).send("Invalid request");
          }
        } else {
          console.log(`[GET/getMessages] hash invalid, rejecting`);
          res.status(404).send("Invalid request");
        }
      });
    }
  });
});

app.get("/read", (req, res) => {
  if (!req.query.hash) {
    res.send("not for you");
    console.log(`[GET/write] no hash given, rejecting`);
    return;
  }
  const hash = req.query.hash as string;
  const shortHash = hash.slice(undefined, 8) + "...";
  console.log(`[GET/read] with hash: ${shortHash}`);
  findHash(db, hash, (result: usesRow[]) => {
    if (result.length != 0) {
      result.map((row: usesRow) => {
        if (row.hash === hash) {
          console.log(`[GET/read] verified hash`);
          if (row.has_read == false) {
            console.log(`[GET/read] hash has not read sending`);
            res
              .status(200)
              .sendFile(path.join(__dirname, "public", "index.html"));
          } else {
            console.log(`[GET/read] hash has already read, rejecting`);
            res.status(404).send("Invalid request");
          }
        } else {
          console.log(`[GET/read] hash invalid, rejecting`);
          res.status(404).send("Invalid request");
        }
      });
    }
  });
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
  if (!req.query.hash) {
    res.status(404).send("not for you");
    console.log("[GET/:id] no hash given, rejecting");
    return;
  }
  const hash = req.query.hash as string;
  const shortHash = hash.slice(undefined, 8) + "...";
  console.log(`[GET/id] hit from hash ${shortHash}`);
  findHash(db, req.params.id, (result: usesRow[]) => {
    if (result.length > 0) {
      console.log(`[GET/id] hash found, redirecting`);
      res.status(200).redirect(`/write?hash=${req.params.id}`);
    } else {
      console.log(`[GET/id] rejecting hash`);
      res.send("Not for you");
    }
  });
});

https
  .createServer(
    {
      cert: fs.readFileSync("/etc/letsencrypt/live/imboard.one/fullchain.pem"),
      key: fs.readFileSync("/etc/letsencrypt/live/imboard.one/privkey.pem"),
    },
    app
  )
  .listen(443, () => {
    console.log("server listening on 443");
  });
