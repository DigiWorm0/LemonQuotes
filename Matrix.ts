import * as Matrix from "matrix-bot-sdk";
import * as Colors from "colors";
import { EventHandler } from "./EventHandler";
import Config from "./config.json";

/**
 * Represents a Matrix Client
 */
export class MatrixHandler {
    client: Matrix.MatrixClient;
    storage: Matrix.SimpleFsStorageProvider;
    msgsStack: string[];

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
        this.client.sendText(Config.matrix.room, msg);
    }

    /**
     * Fires when a quote is received somewhere
     * @param author - ID of the quote's author
     * @param txt - The quote in question
     */
     async onQuote(author: string, txt: string)
     {
        //this.msgsStack.push(txt);
     }
}