import { message } from "../Reader";
import "./messageComponent.css";

export default function MessageComponent(props: { message: message }) {
  return (
    <div className="message-component-wrapper">
      {/* <div className="message-component"> */}
      <div className="message-component tail">
        <p>{props.message.body}</p>
        <h4>{props.message.id}</h4>
        {/* <div className="tail"></div> */}
      </div>
    </div>
  );
}
