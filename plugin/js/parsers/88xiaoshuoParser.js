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

parserFactory.register("m.88xiaoshuo.net", () => create_88xiaoshuoParserInstance());
parserFactory.register("88xiaoshuo.net", () => create_88xiaoshuoParserInstance());
parserFactory.register("m.ilwxs.com", () => create_88xiaoshuoParserInstance());
parserFactory.register("ilwxs.com", () => create_88xiaoshuoParserInstance());
parserFactory.register("m.ttshu8.com", () => create_88xiaoshuoParserInstance());
parserFactory.register("ttshu8.com", () => create_88xiaoshuoParserInstance());
parserFactory.register("m.xpaoshuba.com", () => create_88xiaoshuoParserInstance());
parserFactory.register("xpaoshuba.com", () => create_88xiaoshuoParserInstance());
parserFactory.register("m.shuhaige.net", () => create_88xiaoshuoParserInstance());
parserFactory.register("shuhaige.net", () => create_88xiaoshuoParserInstance());
parserFactory.register("m.qbxsw.com", () => create_88xiaoshuoParserInstance());
parserFactory.register("qbxsw.com", () => create_88xiaoshuoParserInstance());
parserFactory.register("m.38xs.com", () => create_88xiaoshuoParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function create_88xiaoshuoParserInstance() {
    return new _88xiaoshuoParser();
}

class _88xiaoshuoParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        let changedomurl = dom.baseURI;
        if (changedomurl.includes("https://www.")) {
            changedomurl = changedomurl.replace("https://www.","https://m.");
        }
        if (changedomurl != dom.baseURI) {
            dom = (await HttpClient.fetchHtml(changedomurl)).responseXML;
        }
        return this.getChapterUrlsFromMultipleTocPages(dom,
            this.extractPartialChapterList,
            this.getUrlsOfTocPages,
            chapterUrlsUI
        );
    }

    getUrlsOfTocPages(dom) {
        let lastPagespan = [...dom.querySelectorAll(".caption > span > a")];
        let lastPage = null;
        for (let node of lastPagespan) {
            if (node.innerText == "尾页" || node.innerText == "Last page") {
                lastPage = node;
            }
        }
        let urls = [];
        if (lastPage) {
            const lastPageNumber = parseInt(lastPage.href.substring(lastPage.href.search(/_[0-9]+\/?$/)).replace("_", "").replace("/", ""));
            const baseUrl = lastPage.baseURI.replace(/_[0-9]+\/$/, "").replace(/\/$/, "");
            for (let i = 2; i <= lastPageNumber; i++) {
                urls.push(`${baseUrl}_${i}`);
            }
        }
        return urls;
    }

    extractPartialChapterList(dom) {
        let chapterList = dom.querySelector(".read");
        return [...chapterList.querySelectorAll("a")].map(a => util.hyperLinkToChapter(a));
    }

    findContent(dom) {
        return dom.querySelector("div.content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector(".name");
    }

    extractAuthor(dom) {
        let element = dom.querySelector("#maininfo a[href*=\"author\"], .author a");
        return (element === null) ? "" : element.textContent;
    }

    findChapterTitle(dom) {
        let element = dom.querySelector(".headline");
        return (element === null) ? null : element.textContent;
    }

    async fetchChapter(url) {
        return this.walkPagesOfChapter(url, this.moreChapterTextUrl);
    }

    moreChapterTextUrl(dom) {
        let isNextPageOfChapter = (link) => link.href.includes("_") && link.textContent == "下一页";
        let nextUrl = [...dom.querySelectorAll(".pager a")]
            .filter(isNextPageOfChapter)
            .map(a => a.href)
            .pop();
        return nextUrl ?? null;
    }

    findCoverImageUrl(dom) {
        return dom.querySelector(".box_con img, .detail > img")?.src ?? null;
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("#maininfo, .detail")];
    }

    extractDescription(dom) {
        let element = dom.querySelector("#intro");
        return (element === null) ? null : element.textContent;
    }
}
