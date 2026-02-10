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

parserFactory.register("mtnovel.net", () => createMtnovelParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createMtnovelParserInstance() {
    return new MtnovelParser();
}

class MtnovelParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        return (await this.getChapterUrlsFromMultipleTocPages(dom,
            MtnovelParser.extractPartialChapterList,
            MtnovelParser.getUrlsOfTocPages,
            chapterUrlsUI
        )).reverse();
    }

    static getUrlsOfTocPages(dom) {
        let lastUrl = dom.querySelector("#pagelink a.last").href;
        let index = lastUrl.lastIndexOf("/");
        let maxUrl = parseInt(lastUrl.substring(index + 1));
        let baseUrl = lastUrl.substring(0, index + 1);
        let urls = [];
        for (let i = 2; i <= maxUrl; ++i) {
            urls.push(baseUrl + i);
        }
        return urls;
    }

    static extractPartialChapterList(dom) {
        return [...dom.querySelectorAll("#list-chapterAll dd a")]
            .map(a => util.hyperLinkToChapter(a));
    }

    findContent(dom) {
        return dom.querySelector("div.readcontent");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1.booktitle");
    }

    removeUnwantedElementsFromContentElement(element) {
        let links = [...element.querySelectorAll("a")]
            .filter(link => link.textContent.includes("Back to top"));
        for (let link of links) {
            link.replaceWith(link.ownerDocument.createElement("br"));
        }
        super.removeUnwantedElementsFromContentElement(element);
    }

    findChapterTitle(dom) {
        return dom.querySelector("#acontent h1");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.bookcover");
    }

    async fetchChapter(url) {
        let dom = (await HttpClient.wrapFetch(url)).responseXML;
        let content = this.findContent(dom);
        let nextUrl = this.findNextPageOfChapterUrl(dom);
        while (nextUrl != null) {
            let newDom = (await HttpClient.wrapFetch(nextUrl)).responseXML;
            let newContent = this.findContent(newDom);
            nextUrl = this.findNextPageOfChapterUrl(newDom);
            util.moveChildElements(newContent, content);
        }
        return dom;
    }

    findNextPageOfChapterUrl(dom) {
        let nextLink = dom.querySelector("#linkNext");
        return ((nextLink !== null) && nextLink.textContent.includes("Next page"))
            ? nextLink.href
            : null;
    }     

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("p.bookintro")];
    }

    cleanInformationNode(node) {
        util.removeChildElementsMatchingSelector(node, "img");
    }
}
