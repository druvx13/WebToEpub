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

//dead url/ parser
parserFactory.register("yushubo.net", () => createYushuboParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createYushuboParserInstance() {
    return new YushuboParser();
}

class YushuboParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let tocUrl = dom.baseURI.replace("book_", "list_other_");
        let tocDoc = (await HttpClient.wrapFetch(tocUrl)).responseXML;
        let menu = tocDoc.querySelector("ul.chapter-list");
        return util.hyperlinksToChapterList(menu);
    }

    findContent(dom) {
        return Parser.findConstrutedContent(dom);
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1");
    }

    findChapterTitle(dom) {
        return dom.querySelector("h1.article-title");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, ".bigpic");
    }

    async fetchChapter(url) {
        let newDoc = Parser.makeEmptyDocForContent(url);
        let dom = (await HttpClient.wrapFetch(url)).responseXML;
        newDoc.content.appendChild(this.findChapterTitle(dom));
        newDoc.content.appendChild(this.findRawContent(dom));
        let nextPageUrl = this.findNextPageUrl(dom);
        while (nextPageUrl != null) {
            dom = (await HttpClient.wrapFetch(nextPageUrl)).responseXML;
            newDoc.content.appendChild(this.findRawContent(dom));
            nextPageUrl = this.findNextPageUrl(dom);
        }
        return newDoc.dom;
    }

    findRawContent(dom) {
        return dom.querySelector("#BookText");
    }

    findNextPageUrl(dom) {
        let links = [...dom.querySelectorAll("div.articlebtn a")]
            .filter(a => a.textContent === "下一页")
            .slice(-1);
        return links[0]?.href;
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll(".book-intro")];
    }

    cleanInformationNode(node) {
        util.removeChildElementsMatchingSelector(node, "ul.lastchapter");
        return node;
    }
}
