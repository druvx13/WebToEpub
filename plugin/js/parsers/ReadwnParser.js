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

parserFactory.register("fannovel.com", () => createReadwnParserInstance());
parserFactory.register("fannovels.com", () => createReadwnParserInstance());
parserFactory.register("fansmtl.com", () => createReadwnParserInstance());
parserFactory.register("fanmtl.com", () => createReadwnParserInstance());
parserFactory.register("novelmt.com", () => createReadwnParserInstance());
parserFactory.register("novelmtl.com", () => createReadwnParserInstance());
parserFactory.register("readwn.com", () => createReadwnParserInstance());
parserFactory.register("wuxiabee.com", () => createReadwnParserInstance());
parserFactory.register("wuxiabee.net", () => createReadwnParserInstance());
parserFactory.register("wuxiabee.org", () => createReadwnParserInstance());
parserFactory.register("wuxiafox.com", () => createReadwnParserInstance());
parserFactory.register("wuxiago.com", () => createReadwnParserInstance());
parserFactory.register("wuxiahere.com", () => createReadwnParserInstance());
parserFactory.register("wuxiahub.com", () => createReadwnParserInstance());
parserFactory.register("wuxiamtl.com", () => createReadwnParserInstance());
parserFactory.register("wuxiaone.com", () => createReadwnParserInstance());
parserFactory.register("wuxiap.com", () => createReadwnParserInstance());
//dead url
parserFactory.register("wuxiapub.com", () => createReadwnParserInstance());
parserFactory.register("wuxiaspot.com", () => createReadwnParserInstance());
parserFactory.register("wuxiar.com", () => createReadwnParserInstance());
parserFactory.register("wuxiau.com", () => createReadwnParserInstance());
parserFactory.register("wuxiazone.com", () => createReadwnParserInstance());

parserFactory.registerRule(
    (url, dom) => ReadwnParser.isReadwn(dom) * 0.8,
    () => createReadwnParserInstance()
);

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createReadwnParserInstance() {
    return new ReadwnParser();
}

class ReadwnParser extends Parser {
    constructor() {
        super();
        this.minimumThrottle = 3000;
    }

    static isReadwn(dom) {
        return (dom.querySelector(ReadwnParser.CoverSelector) !== null)
            && (dom.querySelector(ReadwnParser.AuthorSelector) !== null);
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        return this.getChapterUrlsFromMultipleTocPages(dom,
            ReadwnParser.extractPartialChapterList,
            ReadwnParser.getUrlsOfTocPages,
            chapterUrlsUI
        );
    }

    static getUrlsOfTocPages(dom) {
        let tocLinks = [...dom.querySelectorAll("ul.pagination li a")]
            .map(l => new URL(l.href))
            .filter(l => l.search.includes("page"));
        let pageIds = tocLinks.map(l => parseInt(l.searchParams.get("page")));
        let maxPage = Math.max(...pageIds);
        let baseUrl = tocLinks[0];
        let urls = [];
        for (let i = 1; i <= maxPage; ++i) {
            let params = baseUrl.searchParams;
            params.set("page", i);
            baseUrl.search = params.toString();
            urls.push(baseUrl.href);
        }
        return urls;
    }

    static extractPartialChapterList(dom) {
        return [...dom.querySelectorAll("ul.chapter-list a")]
            .map(link => ({
                sourceUrl:  link.href,
                title: ReadwnParser.makeTitle(link)
            }));
    }

    static makeTitle(link) {
        let num = link.querySelector(".chapter-no").textContent.trim();
        let title = link.querySelector(".chapter-title").textContent.trim();
        return title.includes(num)
            ? title
            : num + ": " + title;
    }

    findContent(dom) {
        return dom.querySelector("div.chapter-content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("div.main-head h1");
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector(ReadwnParser.AuthorSelector);
        return authorLabel?.textContent ?? super.extractAuthor(dom);
    }

    removeUnwantedElementsFromContentElement(element) {
        util.removeChildElementsMatchingSelector(element, ".adsbox");
        super.removeUnwantedElementsFromContentElement(element);
    }

    findChapterTitle(dom) {
        return dom.querySelector("h2");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, ReadwnParser.CoverSelector);
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll(".summary .content")];
    }
}

ReadwnParser.CoverSelector = "figure.cover";
ReadwnParser.AuthorSelector = "span[itemprop='author']";
