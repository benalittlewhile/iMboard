import { message } from "../Reader";
import "./messageComponent.css";

export default function MessageComponent(props: { message: message }) {
  console.log(`
    trying to replace body in ${props.message.body}

    converted:

    ${props.message.body.replace("\r\n", "<br />\r\n")}
  `);
  return (
    <div className="message-component-wrapper">
      {/* <div className="message-component"> */}
      <div className="message-component tail">
        <p className="message-body">
          {/* {props.message.body.replace("\r\n", "<br />\r\n")} */}
          {`${props.message.body.replace("\r\n", "<br />\r\n")}`}
        </p>
        {/* <h6>{props.message.id}</h6> */}
        {/* <div className="tail"></div> */}
      </div>
    </div>
  );
}
