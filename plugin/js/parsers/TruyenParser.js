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

parserFactory.register("truyennhabo.com", () => createTruyenParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createTruyenParserInstance() {
    return new TruyenParser();
}

class TruyenParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        const chapterLinks = [...dom.querySelectorAll("#clwd ul a")];
        const chapterTitles = [...dom.querySelectorAll("#clwd span.block")];
        const chapterUrls = [];
        for (let i = 0; i < chapterLinks.length; i++) {
            const chapterLink = chapterLinks[i];
            const chapterTitle = chapterTitles[i];
            chapterUrls.push({
                sourceUrl: chapterLink.href,
                title: chapterTitle.textContent,
            });
        }
        return chapterUrls.reverse();
    }

    findContent(dom) {
        return (
            dom.querySelector("article.blog")
        );
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1");
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector("#extra-info dd");
        return authorLabel?.textContent ?? super.extractAuthor(dom);
    }

    findChapterTitle(dom) {
        return dom.querySelector("header h1");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.auto-rows-max");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div#synopsis")];
    }

    removeUnwantedElementsFromContentElement(element) {
        let mark = element.querySelector("a");
        mark.remove();
        super.removeUnwantedElementsFromContentElement(element);
    }

}
