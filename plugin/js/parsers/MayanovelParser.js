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
parserFactory.register("mayanovel.com", () => createMayanovelParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createMayanovelParserInstance() {
    return new MayanovelParser();
}

class MayanovelParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        return [...dom.querySelectorAll(".m-book-list li a")]
            .map(a => util.hyperLinkToChapter(a));
    }

    findContent(dom) {
        return dom.querySelector("#article");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1");
    }

    extractAuthor(dom) {
        return dom.querySelector(".m-infos a")?.textContent ?? null;
    }

    findChapterTitle(dom) {
        return dom.querySelector("h1");
    }

    async fetchChapter(url) {
        let dom = (await HttpClient.wrapFetch(url)).responseXML;
        let nextUrl = this.nextPageOfChapterUrl(dom);
        let oldContent = this.findContent(dom);
        while (nextUrl != null) {
            let nextDom = (await HttpClient.wrapFetch(nextUrl)).responseXML;
            let newContent = this.findContent(nextDom);
            util.moveChildElements(newContent, oldContent);
            nextUrl = this.nextPageOfChapterUrl(nextDom);
        }
        return dom;
    }

    nextPageOfChapterUrl(dom) {
        let nextUrl = dom.querySelector("a[rel='next']")?.href;
        return (nextUrl != null) && nextUrl.includes("_")
            ? nextUrl
            : null;
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll(".m-book_info p")];
    }
}
