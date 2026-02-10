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

parserFactory.register("woopread.com", () => createWoopreadParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createWoopreadParserInstance() {
    return new WoopreadParser();
}

class WoopreadParser extends Parser {
    constructor() {
        super();
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1.text-3xl");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.relative .text-text-secondary")];
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector("div.mb-4:nth-of-type(4) a");
        return (authorLabel === null) ? super.extractAuthor(dom) : authorLabel.textContent;
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.relative");
    }

    async getChapterUrls(dom) {
        const chapterLinks = [...dom.querySelectorAll("main.grow .notranslate .mt-8 .grid-cols-1 a")];
        const chapterTitles = [...dom.querySelectorAll("main.grow .line-clamp-2")];

        let chapterList = [];
        for (let i = 0; i < chapterLinks.length; i++) {
            chapterList.push({
                sourceUrl: chapterLinks[i].href,
                title: chapterTitles[i].textContent,
            });
        }

        return chapterList.reverse();
    }
    
    findChapterTitle(dom) {
        return dom.querySelector("h2.text-2xl");
    }

    findContent(dom) {
        return dom.querySelector("div[id^='chapter']");
    }
}
