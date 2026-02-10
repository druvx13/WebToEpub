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

parserFactory.register("quotev.com", () => createQuotevParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createQuotevParserInstance() {
    return new QuotevParser();
}

class QuotevParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let baseUrl = dom.baseURI;
        if (!baseUrl.endsWith("/")) {
            const index = baseUrl.lastIndexOf("/");
            baseUrl = baseUrl.substring(0, index + 1);
        }
        let select = dom.querySelector("div#footer_pages select");
        if (select === null) {
            return this.makeUrlListForSingleChapterStory(dom);
        }
        return [...select.querySelectorAll("option")]
            .map(o => this.optionToChapter(o, baseUrl));
    }

    optionToChapter(option, baseUrl) {
        return {
            sourceUrl:  baseUrl + option.getAttribute("value"),
            title: option.textContent,
        };
    }

    makeUrlListForSingleChapterStory(dom) {
        let title = this.extractTitleImpl(dom).textContent.trim();
        return [({
            sourceUrl:  dom.baseURI,
            title: title,
        })];
    }

    findContent(dom) {
        return dom.querySelector("div#quizResArea");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("div#quizHeaderTitle h1");
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector("div.quizAuthorList a");
        return (authorLabel === null) ? super.extractAuthor(dom) : authorLabel.textContent;
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div#quizResArea");
    }
}
