/**
 * Represents a quote
 */
export class Quote
{
    authorId: string;
    authorName: string;
    text: string;

    /**
     * Creates a quote
     * @param authorName - Name of the author
     * @param authorId - ID of the author
     * @param text - The quote in question
     */
    constructor(authorName, authorId, text)
    {
        this.authorName = authorName;
        this.authorId = authorId;
        this.text = text;
    }
}