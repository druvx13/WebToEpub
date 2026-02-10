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

parserFactory.registerUrlRule(
    url => (util.extractHostName(url).startsWith("booktoki")),
    () => createBooktoki152ParserInstance()
);

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createBooktoki152ParserInstance() {
    return new Booktoki152Parser();
}

class Booktoki152Parser extends Parser {
    constructor() {
        super();
        this.minimumThrottle = 1500;
    }

    async getChapterUrls(dom) {
        return [...dom.querySelectorAll("ul.list-body a")]
            .map(this.linkToChapter)
            .reverse();
    }

    linkToChapter(link) {
        util.removeChildElementsMatchingSelector(link, "span");
        return ({
            sourceUrl:  link.href,
            title: link.textContent.trim()
        });
    }

    findContent(dom) {
        return dom.querySelector("#novel_content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("div.view-content span b");
    }

    findChapterTitle(dom) {
        return dom.querySelector("div.toon-title");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.view-title");
    }

    getInformationEpubItemChildNodes(dom) {
        let nodes = [...dom.querySelectorAll("div.view-content div.view-content")];
        return (nodes.length === 3)
            ? [nodes[1]]
            : [];
    }
}
