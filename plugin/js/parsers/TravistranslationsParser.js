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
parserFactory.register("travistranslations.com", () => createTravistranslationsParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createTravistranslationsParserInstance() {
    return new TravistranslationsParser();
}

class TravistranslationsParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        return [...dom.querySelectorAll("section.mb-4 ul.grid a")]
            .map(a => ({
                sourceUrl:  a.href,
                title: a.querySelector("span").textContent.trim()
            }));
    }

    findContent(dom) {
        return dom.querySelector("div.reader-content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1[title]");
    }

    findChapterTitle(dom) {
        let h2 = dom.querySelector("div.header h2");
        let span = h2.parentElement.querySelector("span")?.textContent ?? "";
        return h2.textContent + " " + span;
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "#primary .container")
            ?.replace("q=55", "q=100") ?? null;
    }

    preprocessRawDom(webPageDom) {
        util.resolveLazyLoadedImages(webPageDom, "img");
        this.addAuthorNotes(webPageDom);
    }

    addAuthorNotes(webPageDom) {
        let content = this.findContent(webPageDom); 
        for (let n of [...content.parentElement.querySelectorAll("div.py-1")]) {
            content.append(n);
        }
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div[property='description']")];
    }
}
