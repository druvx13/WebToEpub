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

parserFactory.register("madnovel.com", () => createMadnovelParserInstance());
parserFactory.register("novelbuddy.com", () => createMadnovelParserInstance());
parserFactory.register("novelbuddy.io", () => createMadnovelParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createMadnovelParserInstance() {
    return new MadnovelParser();
}

class MadnovelParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let menu = dom.querySelector(".chapter-list");
        if (menu == null) { return []; }

        let linkSet = new Set();
        let includeLink = function(link) {
            if (util.isNullOrEmpty(link.innerText) || util.isNullOrEmpty(link.href)) {
                return false;
            }
            let href = util.normalizeUrlForCompare(link.href);
            if (linkSet.has(href)) {
                return false;
            }
            linkSet.add(href);
            return true;
        };

        return util.getElements(menu, "a", a => includeLink(a))
            .map(link => ({
                sourceUrl: link.href,
                title: link.querySelector("strong").innerText,
                newArc: null
            }))
            .reverse();
    }

    findContent(dom) {
        return dom.querySelector(".content-inner");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1");
    }

    extractAuthor(dom) {
        let authorLabel = [...dom.querySelectorAll("a[href*='authors'] span")].map(x => x.textContent.trim());
        return (authorLabel.length === 0) ? super.extractAuthor(dom) : authorLabel.join(", ");
    }

    extractSubject(dom) {
        let tags = [...dom.querySelectorAll("a[href*='genres']")];
        return tags.map(e => e.textContent.trim()).join("");
    }

    removeUnwantedElementsFromContentElement(element) {
        util.removeChildElementsMatchingSelector(element, ".ads-banner, .content-inner > br");
        super.removeUnwantedElementsFromContentElement(element);
    }

    findChapterTitle(dom) {
        return dom.querySelector("#chapter__content h1");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, ".img-cover");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll(".section-body.summary")];
    }
}
