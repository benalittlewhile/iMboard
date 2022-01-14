import React from "react";
import "./writer.css";

function Writer() {
  let [text, setText] = React.useState("What would you like to leave behind?");
  let buttonActive = false;

  let handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event?.target?.value);
  };

  let handleAreaResize = (event: React.ChangeEvent<HTMLTextAreaElement>) => {};

  let handleInputClick = (event: React.MouseEvent<HTMLTextAreaElement>) => {
    setText("");
  };

  let submit = () => {
    console.log(text);
  };

  return (
    <div className="writer-wrapper">
      <textarea
        className="input-box"
        value={text}
        onChange={handleInputChange}
        onClick={handleInputClick}
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
