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

parserFactory.register("boylove.cc", () => createBoyloveParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createBoyloveParserInstance() {
    return new BoyloveParser();
}

class BoyloveParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        return [...dom.querySelectorAll("ul#playlist__item_title_1_url li:not(.chapterOff) a")]
            .map(a => util.hyperLinkToChapter(a));
    }

    findContent(dom) {
        return dom.querySelector("section.reader-cartoon-chapter");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("div.stui-content div.title");
    }

    findChapterTitle(dom) {
        return dom.querySelector("div.title");
    }

    findCoverImageUrl(dom) {
        let div = dom.querySelector("div.stui-content__thumb [style*=background-image]");
        return "https://boylove.cc" + util.extractUrlFromBackgroundImage(div);
    }

    preprocessRawDom(webPageDom) {
        util.resolveLazyLoadedImages(webPageDom, "article img.lazy", "data-original");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("p.desc")];
    }
}
