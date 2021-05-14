import * as Keyv from "keyv";
import * as Colors from "colors";

const DBLocation = 'sqlite://lemondb.sqlite';

/**
 * Represents a Lemon Quote Database
 */
export class DBManager {
    static db: Keyv;

    /**
     * Initializes the Database Manager
     */
    constructor()
    {
        DBManager.init();
    }

    /**
     * Initializes the Database Manager
     */
    static async init()
    {
        DBManager.db = new Keyv(DBLocation);
        DBManager.db.on('error', DBManager.onError.bind(DBManager));

        if (await DBManager.db.get("initialized"))
            return;

        DBManager.db.set("quotes", {"Unknown":[]});
        DBManager.db.set("initialized", true);
    }

    /**
     * Adds a quote to the database
     * @param author - ID of the quote's author (or 'unknown')
     * @param quote - Quote in question
     */
    static async addQuote(author: string, quote: string)
    {
        let quotes = await this.db.get("quotes");
        if (!(author in quotes))
            quotes[author] = [];
        quotes[author].push(quote);
        this.db.set("quotes", quotes);
    }

    /**
     * Gets all of a specific author's quotes
     * @param author - ID of the quote's author (or 'unknown')
     * @returns all of the author's quotes in a promise
     */
    static async getQuote(author: string): Promise<string[]>
    {
        return await this.db.get("quotes")[author];
    }

    /**
     * Fires when a quote is received somewhere
     * @param author - ID of the quote's author
     * @param txt - The quote in question
     */
    static async onQuote(author: string, txt: string)
    {
        this.addQuote(author, txt);
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