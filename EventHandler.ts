import * as Event from "events"
import * as Colors from "colors";
import { Quote } from "./Quote";

/**
 * Handles Global Events
 */
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
    static onQuote(callback: (quote: Quote) => void)
    {
        EventHandler.emitter.addListener("newQuote", callback);
    }

    /**
     * Sends out a new quote
     * @param author - Author of the quote
     * @param txt - The quote in question
     */
    static sendQuote(quote: Quote)
    {
        console.log(Colors.gray(quote.text + " - " + quote.authorName));
        EventHandler.emitter.emit("newQuote", quote);
    }
}