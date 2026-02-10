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
parserFactory.register("kobatochan.com", () => createKobatochanParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createKobatochanParserInstance() {
    return new KobatochanParser();
}

class KobatochanParser extends WordpressBaseParser {
    constructor() {
        super();
    }

    fetchChapter(url) {
        return HttpClient.wrapFetch(url).then((xhr) => {
            let newDom = xhr.responseXML;
            let extraPageUrls = KobatochanParser.findAdditionalPageUrls(newDom);
            KobatochanParser.removePaginationElements(newDom);
            return this.fetchAdditionalPages(newDom, extraPageUrls.reverse());
        });
    }

    static findAdditionalPageUrls(dom) {
        let pages = [];
        for (let a of dom.querySelectorAll("div.pgntn-page-pagination-block a")) {
            if (!pages.includes(a.href)) {
                pages.push(a.href);
            }
        }
        return pages;
    }

    fetchAdditionalPages(dom, extraPageUrls) {
        if (extraPageUrls.length === 0) {
            return Promise.resolve(dom);
        }
        return HttpClient.wrapFetch(extraPageUrls.pop()).then((xhr) => {
            let newDom = xhr.responseXML;
            KobatochanParser.removePaginationElements(newDom);
            let dest = this.findContent(dom);
            let src = this.findContent(newDom);
            for (let node of [...src.childNodes]) {
                dest.appendChild(node);
            }
            return this.fetchAdditionalPages(dom, extraPageUrls);
        });
    }

    static removePaginationElements(dom) {
        return util.removeChildElementsMatchingSelector(dom, "div.page-link, div.pgntn-multipage, div.g-dyn");
    }
}
