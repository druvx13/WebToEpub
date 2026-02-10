/**
 * ReadwnParser.js - Parser for Readwn-based novel sites
 * 
 * Licensed under the LUCA FREE LICENSE
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

parserFactory.register("fannovel.com", () => new ReadwnParser());
parserFactory.register("fannovels.com", () => new ReadwnParser());
parserFactory.register("fansmtl.com", () => new ReadwnParser());
parserFactory.register("fanmtl.com", () => new ReadwnParser());
parserFactory.register("novelmt.com", () => new ReadwnParser());
parserFactory.register("novelmtl.com", () => new ReadwnParser());
parserFactory.register("readwn.com", () => new ReadwnParser());
parserFactory.register("wuxiabee.com", () => new ReadwnParser());
parserFactory.register("wuxiabee.net", () => new ReadwnParser());
parserFactory.register("wuxiabee.org", () => new ReadwnParser());
parserFactory.register("wuxiafox.com", () => new ReadwnParser());
parserFactory.register("wuxiago.com", () => new ReadwnParser());
parserFactory.register("wuxiahere.com", () => new ReadwnParser());
parserFactory.register("wuxiahub.com", () => new ReadwnParser());
parserFactory.register("wuxiamtl.com", () => new ReadwnParser());
parserFactory.register("wuxiaone.com", () => new ReadwnParser());
parserFactory.register("wuxiap.com", () => new ReadwnParser());
parserFactory.register("wuxiapub.com", () => new ReadwnParser());
parserFactory.register("wuxiaspot.com", () => new ReadwnParser());
parserFactory.register("wuxiar.com", () => new ReadwnParser());
parserFactory.register("wuxiau.com", () => new ReadwnParser());
parserFactory.register("wuxiazone.com", () => new ReadwnParser());

parserFactory.registerRule(
    (url, dom) => ReadwnParser.validateReadwnStructure(dom) * 0.8,
    () => new ReadwnParser()
);

class ReadwnParser extends Parser {
    constructor() {
        super();
        this.minimumThrottle = 3000;
    }

    static validateReadwnStructure(dom) {
        const hasCover = dom.querySelector("figure.cover") !== null;
        const hasAuthor = dom.querySelector("span[itemprop='author']") !== null;
        return hasCover && hasAuthor;
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        return this.getChapterUrlsFromMultipleTocPages(
            dom,
            this.buildChapterListFromDom,
            this.buildTocPageUrls,
            chapterUrlsUI
        );
    }

    buildTocPageUrls(dom) {
        const paginationLinks = Array.from(dom.querySelectorAll("ul.pagination li a"));
        const urlsWithPage = paginationLinks
            .map(link => new URL(link.href))
            .filter(url => url.search.includes("page"));
        
        if (urlsWithPage.length === 0) {
            return [];
        }

        const pageNumbers = urlsWithPage.map(url => parseInt(url.searchParams.get("page")));
        const lastPageNumber = Math.max(...pageNumbers);
        const templateUrl = urlsWithPage[0];
        const tocUrls = [];
        
        for (let pageNum = 1; pageNum <= lastPageNumber; pageNum++) {
            const searchParams = templateUrl.searchParams;
            searchParams.set("page", pageNum);
            templateUrl.search = searchParams.toString();
            tocUrls.push(templateUrl.href);
        }
        
        return tocUrls;
    }

    buildChapterListFromDom(dom) {
        const chapterLinks = Array.from(dom.querySelectorAll("ul.chapter-list a"));
        return chapterLinks.map(link => {
            const chapterNumber = link.querySelector(".chapter-no").textContent.trim();
            const chapterTitle = link.querySelector(".chapter-title").textContent.trim();
            const fullTitle = chapterTitle.includes(chapterNumber) 
                ? chapterTitle 
                : `${chapterNumber}: ${chapterTitle}`;
            
            return {
                sourceUrl: link.href,
                title: fullTitle
            };
        });
    }

    findContent(dom) {
        return dom.querySelector("div.chapter-content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("div.main-head h1");
    }

    extractAuthor(dom) {
        const authorElement = dom.querySelector("span[itemprop='author']");
        if (authorElement && authorElement.textContent) {
            return authorElement.textContent;
        }
        return super.extractAuthor(dom);
    }

    removeUnwantedElementsFromContentElement(element) {
        util.removeChildElementsMatchingSelector(element, ".adsbox");
        super.removeUnwantedElementsFromContentElement(element);
    }

    findChapterTitle(dom) {
        return dom.querySelector("h2");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "figure.cover");
    }

    getInformationEpubItemChildNodes(dom) {
        return Array.from(dom.querySelectorAll(".summary .content"));
    }
}
