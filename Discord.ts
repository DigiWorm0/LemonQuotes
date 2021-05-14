import * as Discord from "discord.js"
import * as Colors from "colors";
import { DBManager } from "./Database"
import { EventHandler } from "./EventHandler";
import Config from "./config.json"

/**
 * Represents a Discord Client
 */
export class DiscordHandler
{
    client: Discord.Client;
    msgsStack: string[];

    /**
     * Initialized / Connects the Discord Client
     */
    constructor()
    {
        this.client = new Discord.Client();
        this.client.on('ready', this.onConnect.bind(this));
        this.client.on('message', this.onMessage.bind(this));
        this.client.login(Config.discord.key);

        this.msgsStack = [];
        setInterval(this._sendMessage.bind(this), Config.discord.msginterval);

        EventHandler.onQuote(this.onQuote.bind(this));
    }

    /**
     * Fires when Discord connects to server
     */
    onConnect()
    {
        console.log(Colors.green("Logged into Discord"));
        setTimeout((() => {
            this._ImportChannel("804754140647260230");
        }).bind(this), 5000);
    }
    
    /**
     * Fires when a Discord Message is sent
     * @param msg - Discord Message
     */
    async onMessage(msg: Discord.Message)
    {
        if (msg.content.startsWith("!lqu"))
            this._lquCommand(msg);
        else if (!Config.discord.channels.includes(msg.channel.id))
            return;
        else
            this._SendQuote(msg);
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

    /**
     * Fires once every interval in order to not send too many messages at once
     */
    async _sendMessage()
    {
        if (this.msgsStack.length <= 0)
            return;
        let msg = this.msgsStack.shift();
        
        let channel = (await this.client.channels.fetch(Config.discord.channel) as Discord.TextChannel);
        channel.send(msg);
    }

    /**
     * Handles the !lqu <user> command
     * @param msg - Discord Message
     */
    async _lquCommand(msg: Discord.Message)
    {
        msg.mentions.users.each(async (user) => {
            
            let txt = "**" + user.username + "**: \n";

            let quotes = await DBManager.getQuote(user.id);
            if (quotes)
            {
                quotes.forEach((quote, index) => {
                    if (index % 10 === 9)
                        txt += "--- " + (index + 1) + " ---"
                    txt += "```" + quote + "```";
                });
            }
            else
                txt = user.username + " has no quotes";

            msg.channel.send(txt);
        });
        
        if (msg.mentions.users.size <= 0)
        {
            let quotes = await DBManager.getQuote("Unknown");
            let txt = "**Unknown Author**: \n";

            quotes.forEach((quote) => {
                txt += "```" + quote + "```";
            });

            msg.channel.send(txt);
        }
    }

    /**
     * Handles when a quote is sent in a quote channel
     * @param msg - Discord Message
     */
    async _SendQuote(msg: Discord.Message)
    {
        let txt = msg.content;
        let author = "Unknown";
      
        msg.mentions.users.each(user => {
          txt = txt.replace("<@!" + user.id + ">", user.username);
          author = user.id;
        });

        txt = txt.split("```").join("");

        EventHandler.sendQuote(author, txt);
    }

    /**
     * Imports all of the quotes to a specified channel
     * @param channelId ID of the channel to import
     */
    async _ImportChannel(channelId: string)
    {
        console.log(Colors.cyan("Importing channel " + channelId + "..."));

        let channel = await this.client.channels.fetch(channelId);

        let allMsgs = [];
        let lastId;

        while (true)
        {
            let options = { limit: 100 };
            if (lastId)
                options["before"] = lastId;

            let msgs = await (channel as Discord.TextChannel).messages.fetch(options);
            allMsgs.push(...msgs.array());
            lastId = msgs.last().id;

            if (msgs.size != 100)
                break;
        }

        
        allMsgs.forEach((message, index) => {
            if (index % 10 == 9)
                console.log(Colors.cyan("Imported " + (index + 1) + " messages"));
            this._SendQuote(message);
        });

        console.log(Colors.cyan("Import Finished."));
    }
}