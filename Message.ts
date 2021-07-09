/**
 * Represents a Discord or Matrix Message
 */
export class Message
{
    channel: string;
    text: string;

    /**
     * Creates a custom message to send
     * @param channel - Channel or Room ID
     * @param text - Text of the message
     */
    constructor(channel: string, text: string)
    {
        this.channel = channel;
        this.text = text;
    }
}