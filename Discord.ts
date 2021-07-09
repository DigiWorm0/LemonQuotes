import * as Discord from "discord.js"
import * as Colors from "colors";
import { DBManager } from "./Database"
import { EventHandler } from "./EventHandler";
import * as Config from "./Config.json"
import { Message } from "./Message"
import { Quote } from "./Quote";

/**
 * Represents a Discord Client
 */
export class DiscordHandler
{
    client: Discord.Client;
    msgsStack: Message[];
    lastAuthorName: string;
    lastQuote: Quote;

    /**
     * Initialized / Connects the Discord Client
     */
    constructor()
    {
        this.client = new Discord.Client();
        this.client.on('ready', this.onConnect.bind(this));
        this.client.on('message', this.onMessage.bind(this));
        this.client.login(Config.discord.key);

        this.lastAuthorName = "-1";
        this.msgsStack = [];
        setInterval(this._sendMessage.bind(this), Config.discord.msginterval);

        let authors = DBManager.getAllAuthors();
        authors.forEach(author => {
            if (!(author in DBManager.authors)) {
                console.log(author);
                this.client.users.fetch(author).then((user) => {
                    DBManager.setAuthorName(user.id, user.username);
                });
            }
        });
        
        //this.client.createCommand

        EventHandler.onQuote(this.onQuote.bind(this));
    }

    /**
     * Fires when Discord connects to server
     */
    onConnect()
    {
        console.log(Colors.green("Logged into Discord"));
        /*setTimeout((() => {
            this._ImportChannel("721939717947392000");
        }).bind(this), 5000);*/
    }
    
    /**
     * Fires when a Discord Message is sent
     * @param msg - Discord Message
     */
    async onMessage(msg: Discord.Message)
    {
        if (msg.author.bot)
            return;
        else if (msg.content.startsWith(".lq user "))
            this._lquCommand(msg);
        else if (msg.content.startsWith(".lq trivia"))
            this._lqrCommand(msg);
        else if (msg.content.startsWith(".lq answer"))
            this._lqwCommand(msg);
        else if (msg.content.startsWith(".lq leaderboard"))
            this._lqlCommand(msg);
        else if (msg.content.startsWith(".lq help"))
            this._helpCommand(msg);
        else if (!(msg.channel.id in Config.discord.groups))
            return;
        else
            this._SendQuote(msg);
    }

    /**
     * Fires when a quote is received somewhere
     * @param author - ID of the quote's author
     * @param txt - The quote in question
     */
    async onQuote(quote: Quote)
    {
        if (quote === this.lastQuote)
            return;

        for (let channel in Config.discord.groups)
        {
            let members = Config.discord.groups[channel];
            members.forEach(member => {
                if (member === quote.authorId)
                    this.msgsStack.push(new Message(channel, "```" + quote.text + " - " + quote.authorName + "```"));
            });
        }
    }

    /**
     * Fires once every interval in order to not send too many messages at once
     */
    async _sendMessage()
    {
        if (this.msgsStack.length <= 0)
            return;
        let msg = this.msgsStack.shift();
        let channel = (await this.client.channels.fetch(msg.channel) as Discord.TextChannel);
        channel.send(msg.text);
    }

    /**
     * Handles the !lqw
     * Prints the author of the last quote
     * @param msg - Discord Message
     */
    async _lqwCommand(msg:Discord.Message)
    {
        if (this.lastAuthorName === "-1")
            msg.channel.send("You must run !lqr before you run that command.");
        else
            msg.channel.send("Its from " + this.lastAuthorName + "!");
    }

    /**
     * Handles the !lqr command
     * Prints a random quote
     * @param msg - Discord Message
     */
    async _lqrCommand(msg: Discord.Message)
    {
        let authors = [];
        for (let channel in Config.discord.groups)
        {
            if (Config.discord.groups[channel].includes(msg.author.id))
                authors.push(...Config.discord.groups[channel]);
        }
        if (authors.length <= 0) {
            let msgs = [
                "I don't know you, back off!",
                "Who tf are you?",
                "Whos this guy?",
                "And who might you be?",
                "W h a t  a r e  y o u ?",
                "Your continued existence perplexes me..."
            ];
            msg.reply(msgs[Math.floor(Math.random() * msgs.length)]);
            return;
        }

        let author = "Unknown";
        while (author === "Unknown")
            author = authors[Math.floor(Math.random() * authors.length)];
        let quotes = DBManager.getQuotesByAuthor(author);
        let quote = quotes[Math.floor(Math.random() * quotes.length)];

        this.lastAuthorName = quote.authorName;
        msg.channel.send("**Who is this quote from?** *(.lq answer)*\n```" + quote.text + "```");
    }

    /**
     * Handles the !lql command
     * Prints the quote leaderboard
     * @param msg - Discord Message
     */
    async _lqlCommand(msg: Discord.Message)
    {
        let authors = [];
        for (let channel in Config.discord.groups)
        {
            if (Config.discord.groups[channel].includes(msg.author.id))
                authors.push(...Config.discord.groups[channel]);
        }
        if (authors.length <= 0) {
            let msgs = [
                "I don't know you, back off!",
                "Who tf are you?",
                "Whos this guy?",
                "And who might you be?",
                "W h a t  a r e  y o u ?",
                "Your continued existence perplexes me..."
            ];
            msg.reply(msgs[Math.floor(Math.random() * msgs.length)]);
            return;
        }

        let counts = {};
        authors.forEach(author => {
            if (author !== "Unknown")
                counts[author] = DBManager.getQuotesByAuthor(author).length;
        });

        // Generate Text
        let text = "**====== Quote Leaderboard ======**\n"
        for (let i = 0; i < 10; i++) {
            let max = 0;
            let author = "";

            for (let cauthor in counts) {
                if (counts[cauthor] >= max)
                {
                    author = cauthor;
                    max = counts[cauthor];
                }
            }
            
            if (max === 0)
                break;

            text += "**(" + (i + 1) + ")** " + DBManager.getAuthorName(author) + " - " + max + " quotes\n";
            counts[author] = 0;
        }

        msg.channel.send(text);
        
    }

    /**
     * Handles the !help command
     * Prints a list of available commands
     * @param msg - Discord Message
     */
    async _helpCommand(msg: Discord.Message)
    {
        msg.channel.send(
            "**======== Lemon Quotes ========**\n" +
            "**.lq help** - Prints out this message\n" +
            "**.lq user <user>** - Prints all quotes from that user\n" +
            "**.lq trivia** - Quote Trivia! Prints a random quote\n" +
            "**.lq answer** - Prints the answer from quote trivia\n" +
            "**.lq leaderboard** - Prints the Quote Leaderboard"
        );
    }

    /**
     * Handles the !lqu <user> command
     * Prints all the user's quotes
     * @param msg - Discord Message
     */
    async _lquCommand(msg: Discord.Message)
    {
        if (msg.content.toLowerCase().endsWith("unknown"))
        {
            let quotes = await DBManager.getQuotesByAuthor("Unknown");
            let txt = "**Unknown Author**: \n";

            quotes.forEach((quote) => {
                txt += "```" + quote.text + "```";

                if (txt.length >= 1000)
                {
                    msg.channel.send(txt);
                    txt = "";
                }
            });
        }
        else
        {
            msg.mentions.users.each(async (user) => {
            
                let txt = "**========= " + user.username + " =========:** \n";
    
                let quotes = await DBManager.getQuotesByAuthor(user.id);
                if (quotes)
                {
                    quotes.forEach((quote, index) => {
                        if (index % 10 === 9)
                            txt += "**========= " + (index + 1) + " =========**"
                        txt += "```" + quote.text + "```";
    
                        if (txt.length >= 1000)
                        {
                            msg.channel.send(txt);
                            txt = "";
                        }
                    });
                }
                else
                    txt = user.username + " has no quotes";
    
                msg.channel.send(txt);
            });
            
            if (msg.mentions.users.size <= 0)
                msg.channel.send("Unknown User (!lqu @User#000)");
        }
    }

    /**
     * Handles when a quote is sent in a quote channel
     * @param msg - Discord Message
     */
    async _SendQuote(msg: Discord.Message)
    {
        let quote = new Quote(
            "Unknown",
            "Unknown",
            msg.content
        );
      
        msg.mentions.users.each(user => {
            quote.text = quote.text.replace("<@!" + user.id + ">", "");
            quote.text = quote.text.replace("<@" + user.id + ">", "");
            quote.authorId = user.id;
            quote.authorName = user.username;
        });

        quote.text = quote.text.split("`").join("");
        quote.text = quote.text.replace(" - ", "");

        this.lastQuote = quote;

        EventHandler.sendQuote(quote);
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