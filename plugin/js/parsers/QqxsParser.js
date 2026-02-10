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
parserFactory.register("m.qqxs.vip", () => createQqxsParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createQqxsParserInstance() {
    return new QqxsParser();
}

class QqxsParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        let tocUrl = dom.querySelector("a.btn_toBookShelf")?.href;
        if (tocUrl) {
            dom = (await HttpClient.wrapFetch(tocUrl)).responseXML;
        }

        let tocPage1chapters = this.extractPartialChapterList(dom);
        let urlsOfTocPages  = this.getUrlsOfTocPages(dom);
        return (await this.getChaptersFromAllTocPages(tocPage1chapters,
            this.extractPartialChapterList,
            urlsOfTocPages,
            chapterUrlsUI
        ));
    }

    extractPartialChapterList(dom) {
        return [...dom.querySelectorAll("#chapterlist p a")]
            .map(a => util.hyperLinkToChapter(a));
    }

    getUrlsOfTocPages(dom) {
        return [...dom.querySelectorAll("option")]
            .map(o => "https://m.qqxs.vip/" + o.value);
    }

    findContent(dom) {
        return dom.querySelector("#content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("span.title");
    }

    findChapterTitle(dom) {
        return dom.querySelector("#nr_title");
    }

    async fetchChapter(url) {
        let newDoc = (await HttpClient.wrapFetch(url)).responseXML;
        let content = this.findContent(newDoc);
        let nextPageUrl = this.findNextPageUrl(newDoc);
        while (nextPageUrl != null) {
            let dom = (await HttpClient.wrapFetch(nextPageUrl)).responseXML;
            content.appendChild(this.findContent(dom));
            nextPageUrl = this.findNextPageUrl(dom);
        }
        this.fixImages(content);
        return newDoc;
    }

    findNextPageUrl(dom) {
        let links = [...dom.querySelectorAll("p.Readpage a.p4")]
            .filter(a => a.href.includes("-"));
        return links[0]?.href;
    }

    fixImages(element) {
        let images = [...element.querySelectorAll("img")];
        for (let i of images) {
            if (i.src.includes("juhao.png")) {
                i.remove();
            }
            else if (i.src.includes("gantanhao.png")) {
                i.replaceWith("!");
            }
            else if (i.src.includes("douhao.png")) {
                i.replaceWith(",");
            }
            else if (i.src.includes("wenhao.png")) {
                i.replaceWith("?");
            }
        }
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, ".synopsisArea");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("p.review")];
    }
}
