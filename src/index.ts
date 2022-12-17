import { Client, client, xml } from "@xmpp/client";
import MessageParser from "./classes/message-parser";
import events from "events";
import fs from "fs";
const nws_event = new events.EventEmitter();

class NWWSOI {
  public data: any;
  public testing: boolean;
  public xmpp: Client;
  constructor(data: any) {
    this.data = data;
    if (data.testing) {
      this.testing = true;
    } else {
      if (
        this.data.username !== null &&
        this.data.password !== null &&
        this.data.service_name !== null
      ) {
        const xmpp = client({
          service: "xmpp://nwws-oi.weather.gov",
          domain: "nwws-oi.weather.gov",
          username: this.data.username,
          password: this.data.password,
        }).setMaxListeners(0);
        this.xmpp = xmpp;

        xmpp.on("error", (err) => {
          console.error("Something went wrong: ", err.toString());
        });

        xmpp.on("online", (address) => {
          xmpp.send(
            xml("presence", {
              to:
                "nwws@conference.nwws-oi.weather.gov/" + this.data.service_name,
            })
          );
        });

        xmpp.on("stanza", async (stanza) => {
          if (stanza.is("message")) {
            const x = stanza.getChild("x"); //Get the X stanza, which includes all relevant this.data.
            if (x) {
              //Sometimes, it likes to be stupid,so we make sure X is real.
              if (x.children) {
                //Get the this.data of the message
                const msg = x.children[0];
                const attrs = x.attrs;
                nws_event.emit("unparsed_message_event", {
                  msg: msg,
                  attrs: attrs,
                });
                if (msg && attrs) {
                  //If there issuing this.data, and a valid message then go ahead an parse the warning.
                  const awipsid = attrs.awipsid;
                  if (awipsid) {
                    //AWIPS id means it is a valid issued message, but we still need to parse, and do more saftey-checks.
                    try {
                      const m_msg = new MessageParser(msg, attrs);
                      nws_event.emit("event", m_msg);
                    } catch (err) {
                      console.error("Something went wrong parsing: " + err);
                      console.error("Data:", msg, attrs);
                    }
                  }
                }
              }
            }
          }
        });

        xmpp.start().catch((x) => {
          console.error("A error occured!");
          console.error(x.toString());
        });
      } else {
        throw new Error(
          "Must provide username, password, and service_name if you are not testing."
        );
      }
    }
  }

  returnListener() {
    return nws_event;
  }

  sendTestMessage(attrs: any, msg: string) {
    if (this.testing) {
      nws_event.emit("unparsed_message_event", { msg: msg, attrs: attrs });
      const newmsg = new MessageParser(msg, attrs);
      nws_event.emit("event", newmsg);
    } else {
      throw Error("Can not send a test message while not testing.");
    }
  }
}
// if you want to save all events to txt
// const nws = new NWWSOI({
//   username: "username",
//   password: "pw",
//   service_name: "service",
// });
// nws.returnListener().on("event", (...data: MessageParser[]) => {
//   data.forEach((parser) => {
//     const data = parser.getMessage()

//     fs.appendFile("data.txt", data, () => {
//       console.log("Written the data!")
//     })
//   });
// });

export default NWWSOI;
