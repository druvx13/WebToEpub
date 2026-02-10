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

parserFactory.register("rainofsnow.com", () => createRainOfSnowParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createRainOfSnowParserInstance() {
    return new RainOfSnowParser();
}

class RainOfSnowParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        return this.getChapterUrlsFromMultipleTocPages(dom,
            RainOfSnowParser.extractPartialChapterList,
            RainOfSnowParser.getUrlsOfTocPages,
            chapterUrlsUI
        );
    }

    static extractPartialChapterList(dom) {
        return [...dom.querySelectorAll("div#chapter a:not(.page-numbers)")]
            .map(a => util.hyperLinkToChapter(a));
    }

    static getUrlsOfTocPages(dom) {
        return [...dom.querySelectorAll("ul.page-numbers a.page-numbers:not(.next)")]
            .map(a => a.href);
    }

    findContent(dom) {
        let content = dom.querySelector("div.zoomdesc-cont");
        util.fixDelayLoadedImages(content, "data-src");
        return content;
    }

    extractTitleImpl(dom) {
        return dom.querySelector(".container h2");
    }

    findChapterTitle(dom) {
        return dom.querySelector("li.menu-toc-current")?.textContent ?? null;
    }

    findCoverImageUrl(dom) {
        let img = dom.querySelector(".imagboca1 img");
        return img?.getAttribute("data-src");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("#synop")];
    }
}
