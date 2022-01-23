import React from "react";
import { useSearchParams } from "react-router-dom";
import "./writer.css";

function Writer() {
  const initialText = "What would you like to leave behind?";
  const [searchParams, setSearchParams] = useSearchParams();
  const hash = searchParams.get("hash");
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
