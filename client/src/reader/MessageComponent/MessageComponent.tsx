import { message } from "../Reader";
import "./messageComponent.css";

export default function MessageComponent(props: { message: message }) {
  return (
    <div className="message-component-wrapper">
      <div className="message-component tail">
        <p className="message-body">{props.message.body}</p>
      </div>
    </div>
  );
}
