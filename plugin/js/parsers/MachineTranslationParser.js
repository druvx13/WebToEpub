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
parserFactory.register("machine-translation.org", () => createMachineTranslationParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createMachineTranslationParserInstance() {
    return new MachineTranslationParser();
}

class MachineTranslationParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let toc = dom.querySelector("div.table-body, div.chapter-list");
        return util.hyperlinksToChapterList(toc).reverse();
    }

    findContent(dom) {
        return dom.querySelector("div.read-context");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("div.title b, h2.title");
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector("div.title span, p.author");
        return (authorLabel === null) ? super.extractAuthor(dom) : authorLabel.textContent;
    }

    findChapterTitle(dom) {
        return dom.querySelector(".read-title");
    }

    findCoverImageUrl(dom) {
        let bookimg = dom.querySelector("div.book-img");
        if (bookimg.querySelector("img")) {
            return util.getFirstImgSrc(dom, "div.book-img");
        }
        return util.extractUrlFromBackgroundImage(bookimg);
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.book-info-bottom .context")];
    }
}
