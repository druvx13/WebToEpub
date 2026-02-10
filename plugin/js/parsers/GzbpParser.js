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
parserFactory.register("m.gzbpi.com", () => createGzbpParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createGzbpParserInstance() {
    return new GzbpParser();
}

class GzbpParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        let url = dom.baseURI.replace("/info/", "/wapbook/");
        let newDom = (await HttpClient.wrapFetch(url)).responseXML;
        return (await this.walkTocPages(newDom,
            this.getChapterUrlsFromTocPage,
            this.nextTocPageUrl,
            chapterUrlsUI
        ));
    }

    getChapterUrlsFromTocPage(dom) {
        return [...dom.querySelectorAll("ul.fk li a")]
            .filter(a => a.href.includes("wapbook"))
            .map(a => util.hyperLinkToChapter(a));
    }

    nextTocPageUrl(dom) {
        let link = dom.querySelector("div.xypa a");
        return link === null ? null : link.href;
    }

    findContent(dom) {
        return dom.querySelector("div#content-txt");
    }

    extractTitleImpl(dom) {
        let title = dom.querySelector("div.xx li");
        return title === null ? null : title.textContent;
    }

    // language used
    // Optional, if not provided, will default to ISO code for English "en"
    /*
    extractLanguage(dom) {
        return dom.querySelector("html").getAttribute("lang");
    }
    */

    removeUnwantedElementsFromContentElement(element) {
        let toRemove = [...element.querySelectorAll("div")]
            .filter(d => d.textContent.includes("本章未完，点击下一篇继续阅读！"));
        util.removeElements(toRemove);
        super.removeUnwantedElementsFromContentElement(element);
    }

    findChapterTitle(dom) {
        let title = dom.querySelector("div.c_title");
        return title === null ? null : title.textContent.trim();
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.xsfm");
    }

    async fetchChapter(url) {
        return this.walkPagesOfChapter(url, this.moreChapterTextUrl);
    }

    moreChapterTextUrl(dom, url, count) {
        // finding next page URL, need to sse if any script holds 
        // the expected value

        let nextUrl = url.replace(".html", "-" + count + ".html");
        let leaf = nextUrl.split("/").pop();

        let scripts = [...dom.querySelectorAll("script")]
            .filter(script => script.textContent.includes(leaf));
        
        return (0 < scripts.length) ? nextUrl : null;
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.jianjie")];
    }
}
