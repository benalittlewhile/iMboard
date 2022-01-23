import { message } from "../Reader";
import "./messageComponent.css";

export default function MessageComponent(props: { message: message }) {
  return (
    <div className="message-component-wrapper">
      <div className="message-component">
        <p>{props.message.body}</p>
        <h4>{props.message.id}</h4>
      </div>
    </div>
  );
}
