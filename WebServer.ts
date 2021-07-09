import * as Express from "express"
import * as Config from "./Config.json"
import * as Colors from "colors";
import { DBManager } from "./Database";

/**
 * Represents a local Web Server to show quotes
 */
export class WebServer
{
    app: Express.Express;

    /**
     * Generates and starts the Web Server
     */
    constructor()
    {
        this.app = Express();
        this.app.get("/quotes", this._getQuotes);
        this.app.get("/authors", this._getAuthors);
        this.app.use(Express.static("public"));
        this.app.listen(Config.port, this._onStart);
    }

    /**
     * Executes when the web server starts
     */
    _onStart()
    {
        console.log(Colors.green("Started Web Server at 127.0.0.1:" + Config.port));
    }

    _getAuthors(req: Express.Request, res: Express.Response)
    {
        res.send(JSON.stringify(DBManager.authors));
    }

    _getQuotes(req: Express.Request, res: Express.Response)
    {
        res.send(JSON.stringify(DBManager.quotes))
    }
}