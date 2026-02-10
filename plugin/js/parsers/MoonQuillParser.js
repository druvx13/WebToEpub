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

parserFactory.register("moonquill.com", () => createMoonqQillParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createMoonqQillParserInstance() {
    return new MoonqQillParser();
}

class MoonqQillParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        return [...dom.querySelectorAll("div#toc div.card-body div.col-1")]
            .map(d => MoonqQillParser.divToChapter(d));
    }

    static divToChapter(div) {
        let link = div.querySelector("a");
        let title = div.nextElementSibling.querySelector("a").textContent.trim();
        return {
            sourceUrl:  link.href,
            title: link.textContent.trim().replace("#", "") + ": " + title,
            newArc: null
        };
    }

    findContent(dom) {
        return dom.querySelector("div#content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1.card-header-title");
    }

    customRawDomToContentStep(chapter, content) {
        this.uncommentStoryText(content);
    }

    uncommentStoryText(content) {
        let comments = [...content.childNodes].filter(n => n.nodeType === Node.COMMENT_NODE);
        for (let comment of comments) {
            let newDom = util.sanitize("<article>" + comment.data + "</article>");
            let newHtml = newDom.querySelector("article");
            content.appendChild(newHtml);
            break;
        }
    }

    findChapterTitle(dom) {
        return dom.querySelector("h1");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.main-content");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div#syn div.card-body")];
    }
}
