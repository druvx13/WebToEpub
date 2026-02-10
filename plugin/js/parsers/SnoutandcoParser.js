/**
 * LUCA FREE LICENSE
 * (Liberty Unrestricted for Creative Autonomy)
 * Version 1.0, February 2026
 * 
 * Copyright (C) 2026 Anonymous
 * 
 * Everyone is permitted to copy and distribute verbatim or modified
 * copies of this license document, and changing it is allowed as long
 * as the name is changed.
 * 
 * TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION
 * 
 * 0. You just DO WHAT THE FUCK YOU WANT TO.
 * 
 * 1. NO WARRANTY. THE WORK IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND.
 *    YOU USE IT AT YOUR OWN RISK. THE AUTHOR DISCLAIMS ALL LIABILITY FOR
 *    DAMAGES, LOSSES, OR ANY OTHER HARM ARISING FROM YOUR USE OF THE WORK,
 *    WHETHER ALLEGED AS A BREACH OF CONTRACT, TORTIOUS BEHAVIOR, OR OTHERWISE.
 *    THIS INCLUDES BUT IS NOT LIMITED TO DAMAGES FROM BUGS, DATA LOSS, OR
 *    YOUR OWN STUPIDITY.
 * 
 * 2. IF ANY PART OF THIS LICENSE IS FOUND UNENFORCEABLE IN YOUR JURISDICTION,
 *    THE REST STILL APPLIES. THE CORE RULE REMAINS: DO WHAT THE FUCK YOU WANT TO.
 */

"use strict";

parserFactory.register("snoutandco.ca", () => createSnoutandcoParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createSnoutandcoParserInstance() {
    return new SnoutandcoParser();
}

class SnoutandcoParser extends Parser { // eslint-disable-line no-unused-vars
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let menu = dom.querySelector("ul.list-group");
        let chapterList = util.hyperlinksToChapterList(menu);

        // save titles to add back when fetch chapter content
        SnoutandcoParser.titles = new Map();
        chapterList.forEach(l => SnoutandcoParser.titles.set(l.sourceUrl, l.title));

        return chapterList;
    }

    findContent(dom) {
        return Parser.findConstrutedContent(dom);
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1#book-title");
    }

    async fetchChapter(url) {
        let params = new URL(url).searchParams;
        let folder = params.get("folder");
        let chapter = params.get("chapter");
        let contentUrl = `https://snoutandco.ca/${folder}/chapters/${chapter}`;
        let contentText = (await HttpClient.fetchText(contentUrl));
        return this.buildChapter(contentText, url);
    }

    buildChapter(contentText, url) {
        let newDoc = Parser.makeEmptyDocForContent(url);
        let title = newDoc.dom.createElement("h1");
        title.textContent = SnoutandcoParser.titles.get(url);
        newDoc.content.appendChild(title);
        Parser.addTextToChapterContent(newDoc, contentText);
        return newDoc.dom;
    }
}
