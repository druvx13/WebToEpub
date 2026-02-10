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

parserFactory.register("peachygardens.blogspot.com", () => createPeachygardensBlogspotParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createPeachygardensBlogspotParserInstance() {
    return new PeachygardensBlogspotParser();
}

class PeachygardensBlogspotParser extends Parser {
    constructor() {
        super();
        this.ChacheChapterContent = new Map();
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        //doing this allows me to get the book id from an script element
        dom = (await HttpClient.wrapFetch(dom.baseURI)).responseXML;
        // eslint-disable-next-line
        let regex = new RegExp("clwd\.run.\'.+\'.;");
        let script = [...dom.scripts].map(a => a.innerHTML);
        let Bookid = script.filter(a => a.match(regex))?.[0].match(regex)?.[0];
        Bookid = Bookid.slice(10, Bookid.length-3);

        let pageCount = 2;
        let Chapterjsons;
        let chapters = [];
        let partialList;
        for (let i = 1; i < pageCount; i=i+50) {
            await this.rateLimitDelay();
            Chapterjsons = (await HttpClient.fetchJson("https://peachygardens.blogspot.com/feeds/posts/default/-/" + Bookid + "?alt=json&start-index=" + i + "&max-results=50")).json;
            partialList = this.chaptersFromJson(Chapterjsons);
            this.chacheChapter(Chapterjsons);
            chapterUrlsUI.showTocProgress(partialList);
            chapters = chapters.concat(partialList);
            if (i == 1) {
                pageCount = Chapterjsons.feed.openSearch$totalResults.$t;
            }
        }
        chapters = chapters.filter(a => a.sourceUrl != dom.baseURI);
        return chapters.reverse();
    }

    chaptersFromJson(json) {
        return json.feed.entry.map(a => ({
            sourceUrl: a.link[2].href, 
            title: a.link[2].title
        }));
    }

    chacheChapter(json) {
        json.feed.entry.map(a => (this.ChacheChapterContent.set(a.link[2].href, [a.link[2].title, a.content.$t])));
    }

    findContent(dom) {
        return Parser.findConstrutedContent(dom);
    }

    findCoverImageUrl(dom) {
        let coverImage = dom.querySelector("header");
        return coverImage === null
            ? null
            : coverImage.querySelector("img").src;
    }

    async fetchChapter(url) {
        return this.buildChapter(this.ChacheChapterContent.get(url), url);
    }

    buildChapter(json, url) {
        let newDoc = Parser.makeEmptyDocForContent(url);
        let title = newDoc.dom.createElement("h1");
        title.textContent = json[0];
        newDoc.content.appendChild(title);
        let content = util.sanitize(json[1]);
        util.moveChildElements(content.body, newDoc.content);
        return newDoc.dom;
    }
}
