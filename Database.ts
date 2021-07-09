import * as Keyv from "keyv";
import * as Colors from "colors";
import { EventHandler } from "./EventHandler"
import { Quote } from "./Quote";

const DBLocation = 'sqlite://lemon-db.sqlite';

/**
 * Represents a Lemon Quote Database
 */
export class DBManager {
    static db: Keyv;
    static quotes: any;
    static authors: any;

    /**
     * Initializes the Database Manager
     */
    static async init()
    {
        DBManager.db = new Keyv(DBLocation);
        DBManager.db.on('error', DBManager.onError.bind(DBManager));
        DBManager.quotes = await DBManager.db.get("quotes");
        DBManager.authors = await DBManager.db.get("authors");

        EventHandler.onQuote(this.onQuote.bind(this));

        if (await DBManager.db.get("initialized"))
            return;

        await DBManager.db.set("quotes", {"Unknown":[]});
        await DBManager.db.set("authors", {"Unknown":"Unknown"});
        await DBManager.db.set("initialized", true);
        await this.init();
    }

    /**
     * Adds a quote to the database
     * @param author - ID of the quote's author (or 'unknown')
     * @param quote - Quote in question
     */
    static addQuote(quote: Quote)
    {
        if (!(quote.authorId in DBManager.quotes))
            DBManager.quotes[quote.authorId] = [];
        if (!(quote.authorId in DBManager.authors))
            DBManager.setAuthorName(quote.authorId, quote.authorName);
        DBManager.quotes[quote.authorId].push(quote.text);
        this.db.set("quotes", DBManager.quotes);
    }

    /**
     * Gets all of a specific author's quotes
     * @param id - ID of the quote's author (or 'unknown')
     * @returns all of the author's quotes
     */
    static getQuotesByAuthor(id: string): Quote[]
    {
        let textList = DBManager.quotes[id];
        let authorName = this.getAuthorName(id);
        let quoteList = new Array<Quote>();
        textList.forEach(text => {
            quoteList.push(new Quote(
                authorName,
                id,
                text
            ));
        });
        return quoteList;
    }

    /**
     * Gets every quote author
     * @returns A list of every quote author
     */
    static getAllAuthors(): string[]
    {
        return Object.keys(DBManager.quotes);
    }

    /**
     * Gets the name of a quote author
     * @param id - Id of the Author
     * @returns Author Name
     */
    static getAuthorName(id: string): string
    {
        return this.authors[id];
    }

     /**
     * Sets the name of a quote author
     * @param id - Id of the Author
     * @param name - Name of the Author
     */
    static setAuthorName(id: string, name: string)
    {
        DBManager.authors[id] = name;
        DBManager.db.set("authors", DBManager.authors);
    }

    /**
     * Fires when a quote is received somewhere
     * @param author - ID of the quote's author
     * @param txt - The quote in question
     */
    static async onQuote(quote: Quote)
    {
        this.addQuote(quote);
    }
    
    /**
     * Triggers in the event of a database error
     * @param err - Error that occured
     */
    static onError(err: any)
    {
        console.log(Colors.red('Error connecting to DB:\n' + err))
    }
}