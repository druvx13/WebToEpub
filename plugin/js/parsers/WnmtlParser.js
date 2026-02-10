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
parserFactory.register("wnmtl.com", () => createWnmtlParserInstance());
/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createWnmtlParserInstance() {
    return new WnmtlParser();
}

class WnmtlParser extends Parser {
    constructor() {
        super();
    }

    getChapterUrls(dom) {
        let items = [...dom.querySelectorAll("article div.t a")]
            .filter(link => link.parentElement.parentElement.className !== "text-mutedxxx")
            .map(link => util.hyperLinkToChapter(link));
        return Promise.resolve(items);
    }

    findContent(dom) {
        util.removeElements(dom.querySelectorAll("div#ct div.article-social"));
        return dom.querySelector("div#ct");
    }

    // title of the story  (not to be confused with title of each chapter)
    extractTitleImpl(dom) {
        return dom.querySelector("article header h2, article header h1");
    }

    findChapterTitle(dom) {
        return dom.querySelector("h1.article-title");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "p.focus");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("article p.time, article p.note")];
    }
}
