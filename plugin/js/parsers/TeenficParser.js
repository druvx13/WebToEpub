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
parserFactory.register("teenfic.net", () => createTeenficParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createTeenficParserInstance() {
    return new TeenficParser();
}

class TeenficParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let menu = [...dom.querySelectorAll("ul.chapters")].pop();
        return util.hyperlinksToChapterList(menu);
    }

    findContent(dom) {
        return dom.querySelector("div.chapter-content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1.title");
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector("a[itemprop='author']");
        return authorLabel?.textContent ?? super.extractAuthor(dom);
    }

    findChapterTitle(dom) {
        return dom.querySelector(".chapter-title");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "#story-detail");
    }

    async fetchChapter(url) {
        let dom = (await HttpClient.wrapFetch(url)).responseXML;
        let content = this.findContent(dom);
        let pageUrls = this.findOtherPagesOfChapter(dom);
        for (let nextUrl of pageUrls) {
            let newDom = (await HttpClient.wrapFetch(nextUrl)).responseXML;
            let newContent = this.findContent(newDom);
            util.moveChildElements(newContent, content);
        }
        return dom;
    }

    findOtherPagesOfChapter(dom) {
        let seen = new Set();
        let urls = [];
        let links = [...dom.querySelectorAll("ul.page li:not(.active) a")]
            .map(link => link.href);
        for (let link of links) {
            if (!seen.has(link)) {
                urls.push(link);
                seen.add(link);
            }
        }
        return urls;
    }

    getInformationEpubItemChildNodes(dom) {
        return [dom.querySelector("div.description")];
    }
}
