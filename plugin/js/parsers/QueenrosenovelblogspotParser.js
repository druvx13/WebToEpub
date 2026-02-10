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

parserFactory.register("queenrosenovel.blogspot.com", () => createQueenrosenovelblogspotParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createQueenrosenovelblogspotParserInstance() {
    return new QueenrosenovelblogspotParser();
}

class QueenrosenovelblogspotParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        return [...dom.querySelectorAll("div.epcheck li a")]
            .map(this.linkToChapter)
            .reverse();
    }

    linkToChapter(link) {
        return ({
            sourceUrl:  link.href,
            title: link.querySelector(".chapternum").textContent
        });
    }

    findContent(dom) {
        return dom.querySelector("div.Novel");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("header h1");
    }

    findChapterTitle(dom) {
        let title = dom.querySelector("h1");
        util.removeChildElementsMatchingSelector(title, "script");
        return title;
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "figure");
    }

    preprocessRawDom(webPageDom) {
        let content = this.findContent(webPageDom);
        let script = content.querySelector("script").textContent;
        let html = script.substring(script.indexOf("`") + 1, script.length - 1);
        let doc = util.sanitize("<div id='start'>" + html + "</div>");
        content.appendChild(doc.querySelector("div#start"));
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("#synopsis")];
    }
}
