import * as Event from "events"
import * as Colors from "colors";

export class EventHandler
{
    static emitter: Event.EventEmitter;

    constructor()
    {
        EventHandler.emitter = new Event.EventEmitter();
    }

    /**
     * Fires callback function when a new quote is received
     * @param callback Callback function to fire
     */
    static onQuote(callback: (author: string, txt: string) => void)
    {
        EventHandler.emitter.addListener("newQuote", callback);
    }

    /**
     * Sends out a new quote
     * @param author - Author of the quote
     * @param txt - The quote in question
     */
    static sendQuote(author: string, txt: string)
    {
        console.log(Colors.gray(txt))
        EventHandler.emitter.emit("newQuote", author, txt);
    }
}