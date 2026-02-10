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

parserFactory.register("crushnovelpo.blog", () => createCrushnovelParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createCrushnovelParserInstance() {
    return new CrushnovelParser();
}

class CrushnovelParser extends Parser { // eslint-disable-line no-unused-vars
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let numPages = this.getNumberOfPages(dom);
        let urlRoot = dom.baseURI.replace("/novel/", "/read/") + "/chapter-";
        if (50 < numPages) {
            let chapters = [];
            for (let i = 1; i < numPages; ++i) {
                chapters.push(({
                    title:  "Chapter " + i,
                    sourceUrl: urlRoot + i
                }));
            }
            return chapters;
        }

        return [...dom.querySelectorAll("#chapters a")]
            .map(a => ({
                title: a.querySelector("h4").textContent,
                sourceUrl: a.href
            }));
    }

    getNumberOfPages(dom) {
        let script = [...dom.querySelectorAll("script")]
            .map(s => s.textContent)
            .filter(s => s.includes("numberOfPages"))[0];
        if (script) {
            let json = JSON.parse(script);
            return json.numberOfPages;
        }
        return 0;
    }

    findContent(dom) {
        return dom.querySelector(".chapter-content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("main h1");
    }

    findChapterTitle(dom) {
        return dom.querySelector(".container h2");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, ".book-cover");
    }

    preprocessRawDom(webPageDom) {
        let content = this.findContent(webPageDom);
        let toKeep = [...content.querySelectorAll(".prose")];
        content.replaceChildren();
        toKeep.forEach(e => content.appendChild(e));
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("#story-full")];
    }
}
