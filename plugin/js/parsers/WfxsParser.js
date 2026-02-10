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

parserFactory.register("wfxs.tw", () => createWfxsParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createWfxsParserInstance() {
    return new WfxsParser();
}

class WfxsParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let tocUrl = this.makeTocUrl(dom.baseURI);
        let tocHtml = (await HttpClient.wrapFetch(tocUrl)).responseXML;
        let menu = [...tocHtml.querySelectorAll("#readerlists")].pop();
        return util.hyperlinksToChapterList(menu);
    }

    makeTocUrl(url) {
        return url.substring(0, url.length - 1)
            .replace("xiaoshuo", "booklist") + ".html";
    }

    findContent(dom) {
        return Parser.findConstrutedContent(dom);        
    }

    extractTitleImpl(dom) {
        return dom.querySelector(".booktitle h1");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "#bookimg");
    }

    async fetchChapter(url) {
        let newDoc = Parser.makeEmptyDocForContent(url);
        let dom = (await HttpClient.wrapFetch(url)).responseXML;
        newDoc.content.appendChild(this.findRawContent(dom));
        let nextPageUrl = this.findNextPageUrl(dom);
        while (nextPageUrl != null) {
            dom = (await HttpClient.wrapFetch(nextPageUrl)).responseXML;
            newDoc.content.appendChild(this.findRawContent(dom));
            nextPageUrl = this.findNextPageUrl(dom);
        }
        return newDoc.dom;
    }

    findRawContent(dom) {
        return dom.querySelector(".chapter-content");
    }

    findNextPageUrl(dom) {
        let link = [...dom.querySelectorAll(".foot-nav a")]
            .map(l => l.href)[2];
        return ((link != null)  && link.endsWith(".html"))
            ? link
            : null;
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("#intro_win p")];
    }
}
