import { DBManager } from "./Database";
import { DiscordHandler } from "./Discord";
import { EventHandler } from "./EventHandler";
import { MatrixHandler } from "./Matrix";
import { WebServer } from "./WebServer";

/**
 * Represents the entire Lemon Quotes server
 */
export class LemonQuotes {
    event: EventHandler;
    db: DBManager;
    discord: DiscordHandler;
    matrix: MatrixHandler;
    webserver: WebServer;

    /**
     * Initialized the Lemon Quotes server
     */
    async init()
    {
        this.event = new EventHandler();
        this.db = new DBManager();
        
        await DBManager.init();

        this.discord = new DiscordHandler();
        this.matrix = new MatrixHandler();
        this.webserver = new WebServer();
    }
}

let serverInstance = new LemonQuotes();
serverInstance.init();