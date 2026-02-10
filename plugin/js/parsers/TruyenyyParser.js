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

parserFactory.register("truyenyy.com", () => createTruyenyyParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createTruyenyyParserInstance() {
    return new TruyenyyParser();
}

class TruyenyyParser extends Parser {
    constructor() {
        super();
    }

    getChapterUrls(dom, chapterUrlsUI) {
        return this.getChapterUrlsFromMultipleTocPages(dom,
            TruyenyyParser.extractPartialChapterList,
            TruyenyyParser.getUrlsOfTocPages,
            chapterUrlsUI
        );
    }

    static extractPartialChapterList(dom) {
        let previousText = "";
        let mergedlinks = [];
        for (let l of dom.querySelectorAll("table.table a")) {
            if (l.className === "table-chap-title") {
                l.textContent = previousText + ": " + l.textContent.trim();
                mergedlinks.push(l);
            }
            previousText = l.textContent.trim();
        }
        return mergedlinks.map(a => util.hyperLinkToChapter(a));
    }

    static getUrlsOfTocPages(dom) {
        let pagination = dom.querySelector("ul.pagination");
        let tocUrls = [];
        if (pagination != null ) {
            let tocLinks = [...dom.querySelectorAll("a.page-link")]
                .map(a => a.href)
                .filter(href => href.includes("?p="));
            let maxPage = tocLinks
                .map(href => parseInt(href.split("?p=")[1]))
                .reduce((p, c) => Math.max(p, c), -1);
            if (1 < maxPage) {
                let base = tocLinks[0].split("?p=")[0];
                for (let i = 2; i <= maxPage; ++i) {
                    tocUrls.push(`${base}?p=${i}`);
                }
            }
        }
        return tocUrls;
    }

    findContent(dom) {
        return dom.querySelector("div#id_chap_content div.inner");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("div.novel-info .name");
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector("div.novel-info .author a");
        return (authorLabel === null) ? super.extractAuthor(dom) : authorLabel.textContent;
    }

    findChapterTitle(dom) {
        return dom.querySelector("div#id_chap_content .chapter-title");
    }

    findCoverImageUrl(dom) {
        let img = dom.querySelector("div.novel-info img");
        return (img === null) ? img : img.getAttribute("data-src");
    }
}
