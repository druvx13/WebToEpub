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

parserFactory.register("novel543.com", () => createNovel543ParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createNovel543ParserInstance() {
    return new Novel543Parser();
}

class Novel543Parser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let tocUrl = dom.baseURI;
        tocUrl += tocUrl.endsWith("/")
            ? "dir"
            : "/dir";
        let nextDom = (await HttpClient.wrapFetch(tocUrl)).responseXML;
        let menu = nextDom.querySelector("div.chaplist ul:nth-of-type(2)");
        return util.hyperlinksToChapterList(menu);
    }

    findContent(dom) {
        return dom.querySelector("div.chapter-content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1.title");
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector("span.author");
        return authorLabel?.textContent ?? super.extractAuthor(dom);
    }

    extractLanguage() {
        return "zh";
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.cover");
    }

    async fetchChapter(url) {
        return this.walkPagesOfChapter(url, this.moreChapterTextUrl);
    }

    moreChapterTextUrl(dom, baseUrl) {
        // Extract chapter base from original URL (e.g., "8096_1" from "8096_1.html" or "8096_1_2.html")
        let getChapterBase = (url) => {
            let match = url.match(/\/(\d+_\d+)(?:_\d+)?\.html/);
            return match ? match[1] : null;
        };
        
        let baseChapter = getChapterBase(baseUrl);
        if (!baseChapter) return null;
        
        // Find the last link in foot-nav (next chapter link)
        let nextLink = [...dom.querySelectorAll(".foot-nav a")].pop();
        if (!nextLink) return null;
        
        let nextUrl = nextLink.href;
        // Check if the next URL is a continuation of the same chapter
        // (e.g., 8096_1_2.html is a continuation of 8096_1.html)
        if (nextUrl.includes(`/${baseChapter}_`)) {
            return nextUrl;
        }
        return null;
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.intro")];
    }
}
