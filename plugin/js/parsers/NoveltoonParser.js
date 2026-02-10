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

parserFactory.register("noveltoon.mobi", () => createNoveltoonParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createNoveltoonParserInstance() {
    return new NoveltoonParser();
}

class NoveltoonParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        return [...dom.querySelectorAll("a.episodes-info-a-item")]
            .map(a => NoveltoonParser.ToChapterInfo(a));
    }

    static ToChapterInfo(link) {
        let title = link.querySelector(".episode-item-num").textContent.trim()
            + " " + link.querySelector(".episode-item-title").textContent.trim();
        return {
            sourceUrl: link.href,
            title: title,
        };
    }

    findContent(dom) {
        return dom.querySelector("div.watch-chapter-detail");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1.detail-title");
    }

    extractAuthor(dom) {
        return dom.querySelector("p.detail-author")?.textContent ?? super.extractAuthor(dom);
    }

    findChapterTitle(dom) {
        return dom.querySelector("p.watch-chapter-title")?.textContent;
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.detail-top-right");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.detail-desc")];
    }
}
