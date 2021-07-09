import * as Matrix from "matrix-bot-sdk";
import * as Colors from "colors";
import { EventHandler } from "./EventHandler";
import * as Config from "./Config.json"
import { Message } from "./Message"
import { Quote } from "./Quote";

/**
 * Represents a Matrix Client
 */
export class MatrixHandler {
    client: Matrix.MatrixClient;
    storage: Matrix.SimpleFsStorageProvider;
    msgsStack: Message[];

    /**
     * Initialized / Connects the Matrix Client
     */
    constructor()
    {
        this.storage = new Matrix.SimpleFsStorageProvider("matrix-db.json");
        this.client = new Matrix.MatrixClient(
            Config.matrix.server,
            Config.matrix.key,
            this.storage
        );
        Matrix.AutojoinRoomsMixin.setupOnClient(this.client);
        this.client.start().then(this.onConnect.bind(this));

        this.msgsStack = [];
        setInterval(this._sendMessage.bind(this), Config.matrix.msginterval);
        
        EventHandler.onQuote(this.onQuote.bind(this));
    }

    /**
     * Fires when Matrix connects to server
     */
    onConnect()
    {
        console.log(Colors.green("Logged into Matrix"));
    }

    /**
     * Fires once every interval in order to not send too many messages at once
     */
    _sendMessage()
    {
        if (this.msgsStack.length <= 0)
            return;
        
        let msg = this.msgsStack.shift();
        this.client.sendText(msg.channel, msg.text);
    }

    /**
     * Fires when a quote is received somewhere
     * @param author - ID of the quote's author
     * @param txt - The quote in question
     */
     async onQuote(quote: Quote)
     {
        for (let room in Config.matrix.groups)
        {
            let members = Config.matrix.groups[room];
            members.forEach(member => {
                if (member === quote.authorId)
                    this.msgsStack.push(new Message(room, quote.text + " - " + quote.authorName));
            });
        }
     }
}