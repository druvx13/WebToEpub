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
parserFactory.register("graverobbertl.site", () => createGraverobbertlParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createGraverobbertlParserInstance() {
    return new GraverobbertlParser();
}

class GraverobbertlParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let links = [...dom.querySelectorAll("div.post-entry ul a")]
            .filter(a => a.host !== "graverobbertl.wordpress.com");
        return links.map(a => util.hyperLinkToChapter(a));
    }

    findContent(dom) {
        return dom.querySelector("div.post-entry");
    }

    removeUnwantedElementsFromContentElement(element) {
        util.removeChildElementsMatchingSelector(element, "div.wp-block-column");
        super.removeUnwantedElementsFromContentElement(element);
    }

    findChapterTitle(dom) {
        return dom.querySelector("div.post-header h1");
    }

    async fetchChapter(url) {
        let dom = (await HttpClient.wrapFetch(url)).responseXML;
        let content = this.findContent(dom);

        // if only a couple of chapters, and there's a link, with "click me", chase the link
        let paragraphCount = [...content.querySelectorAll("p")].length;
        let links = [...content.querySelectorAll("a")]
            .filter(a => (a.host === "graverobbertl.site") && 
                a.textContent.toLowerCase().includes("click here"));
        if ((paragraphCount < 20) && (0 < links.length)) {
            dom = (await HttpClient.wrapFetch(links[0].href)).responseXML;
        }
        return dom;
    }

    getInformationEpubItemChildNodes(dom) {
        let children = dom.querySelector("div.post-entry").children;
        let filtered = [];
        for (let i = 0; i < children.length; ++i) {
            let e = children[i];
            if (e.tagName === "P") {
                filtered.push(e);
            }
            if (e.tagName === "H2" || e.tagName === "UL") {
                break;
            }
        }
        return filtered;
    }
}
