import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./writer.css";

function Writer() {
  const initialText =
    "\t\tYou found a secret!\r\n-That qr code is one of several scattered about. \r\n-It will work only once, letting you leave one message. You can share a thought you had recently, a story, anything you like.\r\n-After writing your message you can read messages other people have left from other qr codes like it.\r\n\tWhat would you like to say?";
  const [searchParams, setSearchParams] = useSearchParams();
  const hash = searchParams.get("hash");
  let navigate = useNavigate();
  let [text, setText] = React.useState(initialText);
  let buttonActive = false;

  let handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event?.target?.value);
    // event.target.style.height = "auto";
    // event.target.style.height = `${event.target.scrollHeight}px`;
  };

  let handleInputClick = (event: React.MouseEvent<HTMLTextAreaElement>) => {
    if (text == initialText) {
      setText("");
    }
  };

  let handleFocusLoss = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    if (text == "") {
      setText(initialText);
    }
  };

  let submit = () => {
    const url = window.location.href; /*.split("?")[0];*/
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: text }),
    }).then(() => {
      navigate(`/read?hash=${hash}`, { replace: true });
      // navigate(`/read`, { replace: true });
    });
  };

  return (
    <div className="writer-wrapper">
      <textarea
        className="input-box"
        value={text}
        onChange={handleInputChange}
        onClick={handleInputClick}
        onBlur={handleFocusLoss}
        maxLength={1024 * 512}
      />
      <button
        className={`submit-button ${buttonActive ? "button-active" : ""}`}
        onClick={submit}
      >
        Submit
      </button>
    </div>
  );
}

export default Writer;
