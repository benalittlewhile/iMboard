import { useEffect, useState } from "react";
import MessageComponent from "./MessageComponent/MessageComponent";
import "./reader.css";
import "./tail.css";

export interface message {
  id: number;
  body: string;
}

function Reader() {
  const mockMessageList: message[] = [];

  let [messages, setMessages] = useState(mockMessageList);

  useEffect(() => {
    updateMessages();
  }, []);

  function makeMessagesUrl(): string {
    const base = window.location.href;
    const parts = base.split("read");
    const dest = parts[0] + "getMessages" + parts[1];
    console.log(`generated dest ${dest}`);
    return dest;
  }

  async function fetchMessages() {
    return fetch(makeMessagesUrl(), { method: "GET" }).then((res) =>
      res.json()
    );
  }

  async function updateMessages() {
    console.log("updatemessages");
    const messages = await fetchMessages();
    console.log(`fetched messages ${JSON.stringify(messages)}`);
    setMessages(messages);
  }

  return (
    <div className="reader-wrapper">
      <h1>See what others have left</h1>
      <ul className="message-list">
        {messages.map((thisMessage: message) => (
          <div className="message-list-item">
            <MessageComponent message={thisMessage} />
          </div>
        ))}
      </ul>
    </div>
  );
}

export default Reader;
