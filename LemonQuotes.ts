import { DBManager } from "./Database";
import { DiscordHandler } from "./Discord";
import { EventHandler } from "./EventHandler";
import { MatrixHandler } from "./Matrix";

/**
 * Represents the entire Lemon Quotes server
 */
export class LemonQuotes {
    event: EventHandler;
    db: DBManager;
    discord: DiscordHandler;
    matrix: MatrixHandler;

    /**
     * Initialized the Lemon Quotes server
     */
    constructor()
    {
        this.event = new EventHandler();
        this.db = new DBManager();
        this.discord = new DiscordHandler();
        this.matrix = new MatrixHandler();
    }
}

let serverInstance = new LemonQuotes();