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
parserFactory.register("m.metanovel.org", () => createMetanovelParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createMetanovelParserInstance() {
    return new MetanovelParser();
}

class MetanovelParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        let tocUrl = dom.baseURI + "/chapters/1";
        let tocPage = (await HttpClient.wrapFetch(tocUrl)).responseXML;

        return (await this.walkTocPages(tocPage, 
            this.chaptersFromDom, 
            this.nextTocPageUrl, 
            chapterUrlsUI
        ));
    }

    chaptersFromDom(dom) {
        let menu = dom.querySelector(".section-list");
        return util.hyperlinksToChapterList(menu);
    }

    nextTocPageUrl(dom) {
        let nextUrl = dom.querySelector(".listpage span.right a")?.href;
        return util.isNullOrEmpty(nextUrl) ? null : nextUrl;
    }
    
    findContent(dom) {
        return dom.querySelector("#content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector(".detail-box h1");
    }

    findChapterTitle(dom) {
        return dom.querySelector("h1.title");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, ".imgbox");
    }

    async fetchChapter(url) {
        return this.walkPagesOfChapter(url, this.moreChapterTextUrl);
    }

    moreChapterTextUrl(dom) {
        let nextUrl = [...dom.querySelectorAll(".section-opt a")].pop()?.href;
        return (nextUrl != null && nextUrl.includes("?page"))
            ? nextUrl
            : null;
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll(".desc")];
    }
}
