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

parserFactory.register("buntls.com", () => createBuntlsParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createBuntlsParserInstance() {
    return new BuntlsParser();
}

class BuntlsParser extends Parser {
    constructor() {
        super();
        this.minimumThrottle = 2600;
    }

    async getChapterUrls(dom) {
        let all = [...dom.querySelectorAll("#chapter-group-unassigned a")];

        let chapters = all.map(a => ({
            sourceUrl: a.href, 
            title: a.textContent
        }));
        return chapters;
    }

    extractTitleImpl(dom) {
        return dom.querySelector(".story__identity-title h1")?.textContent ?? null;
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll(".story__identity-title, .story__summary content-section")];
    }

    findCoverImageUrl(dom) {
        return dom.querySelector(".story__thumbnail img")?.src ?? null;
    }

    findChapterTitle(dom) {
        return dom.querySelector(".chapter__title");
    }

    findContent(dom) {
        return dom.querySelector("#chapter-content");
    }

    removeUnwantedElementsFromContentElement(content) {
        let toremove = content.querySelectorAll("#load-content-button, .wpulike, script");
        for (let element of toremove) {
            element.remove();
        }
        this.makeHiddenElementsVisible(content);
        super.removeUnwantedElementsFromContentElement(content);
    }

    makeHiddenElementsVisible(content) {
        [...content.querySelectorAll("div")]
            .filter(e => (e.style.display === "none"))
            .forEach(e => e.removeAttribute("style"));
    }
}
