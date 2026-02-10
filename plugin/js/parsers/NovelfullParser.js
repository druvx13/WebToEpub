/**
 * NovelfullParser.js - Parser for Novelfull-based novel sites
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

parserFactory.register("allnovel.org", () => new NovelfullParser());
parserFactory.register("allnovelbin.net", () => new NovelfullParser());
parserFactory.register("allnovelfull.app", () => new NovelfullParser());
parserFactory.register("allnovelfull.com", () => new NovelfullParser());
parserFactory.register("allnovelfull.org", () => new NovelfullParser());
parserFactory.register("allnovelfull.net", () => new NovelfullParser());
parserFactory.register("allnovelnext.com", () => new NovelfullParser());
parserFactory.register("all-novelfull.net", () => new NovelfullParser());
parserFactory.register("boxnovelfull.com", () => new NovelfullParser());
parserFactory.register("freenovelsread.com", () => new NovelfullParser());
parserFactory.register("freewn.com", () => new NovelfullParser());
parserFactory.register("novel-bin.com", () => new NovelHyphenBinParser());
parserFactory.register("novel-bin.net", () => new NovelHyphenBinParser());
parserFactory.register("novel-bin.org", () => new NovelHyphenBinParser());
parserFactory.register("novel-next.com", () => new NovelfullParser());
parserFactory.register("novel35.com", () => new Novel35Parser());
parserFactory.register("novelactive.org", () => new NovelfullParser());
parserFactory.register("novelbin.com", () => new NovelbinParser());
parserFactory.register("novelbin.me", () => new NovelfullParser());
parserFactory.register("novelbin.net", () => new NovelfullParser());
parserFactory.register("novelbin.org", () => new NovelfullParser());
parserFactory.register("noveldrama.org", () => new NovelfullParser());
parserFactory.register("novelebook.net", () => new NovelfullParser());
parserFactory.register("novelfull.com", () => new NovelfullParser());
parserFactory.register("novelfull.net", () => new NovelfullParser());
parserFactory.register("novelfullbook.com", () => new NovelfullParser());
parserFactory.register("novelfulll.com", () => new NovelfullParser());
parserFactory.register("novelhulk.net", () => new NovelfullParser());
parserFactory.register("novelmax.net", () => new NovelfullParser());
parserFactory.register("novelnext.com", () => new NovelfullParser());
parserFactory.register("novelnext.dramanovels.io", () => new NovelfullParser());
parserFactory.register("novelnext.net", () => new NovelfullParser());
parserFactory.register("novelnextz.com", () => new NovelfullParser());
parserFactory.register("noveltop1.org", () => new NovelfullParser());
parserFactory.register("noveltrust.net", () => new NovelfullParser());
parserFactory.register("novelusb.com", () => new NovelfullParser());
parserFactory.register("novelusb.net", () => new NovelfullParser());
parserFactory.register("novelxo.net", () => new NovelfullParser());
parserFactory.register("novlove.com", () => new NovelfullParser());
parserFactory.register("readnovelfull.me", () => new NovelfullParser());
parserFactory.register("thenovelbin.org", () => new NovelfullParser());
parserFactory.register("topnovelfull.com", () => new NovelfullParser());
parserFactory.register("zinnovel.net", () => new NovelfullParser());

parserFactory.registerManualSelect("NovelNext", () => new NovelfullParser());

class NovelfullParser extends Parser {
    constructor() {
        super();
        this.minimumThrottle = 1000;
    }

    async addParsersToPages(pagesToFetch) {
        for (const page of pagesToFetch) {
            page.parser = this;
        }
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        return this.getChapterUrlsFromMultipleTocPages(
            dom,
            this.extractPartialChapterList,
            this.getUrlsOfTocPages,
            chapterUrlsUI
        );
    }

    getUrlsOfTocPages(dom) {
        const lastPageLink = dom.querySelector("li.last a");
        const tocPageUrls = [];
        
        if (!lastPageLink) {
            return tocPageUrls;
        }

        let totalPages = lastPageLink.getAttribute("data-page");
        if (!totalPages) {
            const linkUrl = new URL(lastPageLink.href);
            totalPages = linkUrl.searchParams.get("page_num") || null;
        }
        
        const pageCount = parseInt(totalPages || "-1") + 1;
        for (let pageIndex = 1; pageIndex <= pageCount; pageIndex++) {
            const tocUrl = this.constructTocPageUrl(lastPageLink, pageIndex);
            tocPageUrls.push(tocUrl);
        }
        
        return tocPageUrls;
    }

    constructTocPageUrl(linkElement, pageNumber) {
        const hostname = linkElement.hostname;
        
        if (hostname === "freenovelsread.com") {
            const pathSegments = linkElement.pathname.split("/");
            linkElement.pathname = pathSegments[1] + "/" + pageNumber;
        } else if (hostname === "novelfulll.com") {
            linkElement.search = `?page_num=${pageNumber}`;
        } else {
            linkElement.search = `?page=${pageNumber}&per-page=50`;
        }
        
        return linkElement.href;
    }

    extractPartialChapterList(dom) {
        const chapterLinks = Array.from(dom.querySelectorAll("ul.list-chapter a"));
        return chapterLinks.map(link => util.hyperLinkToChapter(link));
    }

    findContent(dom) {
        const contentById = dom.querySelector("#chr-content");
        const contentByClass = dom.querySelector("#chapter-content");
        return contentById || contentByClass;
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h3.title");
    }

    extractAuthor(dom) {
        const metaItems = Array.from(dom.querySelectorAll("ul.info-meta li"));
        const authorItems = metaItems
            .filter(item => {
                const heading = item.querySelector("h3");
                return heading && heading.textContent === "Author:";
            })
            .map(item => {
                const authorLink = item.querySelector("a");
                return authorLink ? authorLink.textContent : null;
            });
        
        return authorItems.length > 0 ? authorItems[0] : super.extractAuthor(dom);
    }

    preprocessRawDom(dom) {
        this.processWatermarkInDom(dom);
    }

    findChapterTitle(dom) {
        const titleElement = dom.querySelector("h2");
        return titleElement ? titleElement.textContent : null;
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.book");
    }

    getInformationEpubItemChildNodes(dom) {
        return Array.from(dom.querySelectorAll("div.desc-text, div.info"));
    }

    processWatermarkInDom(dom) {
        const watermarkText = this.extractWatermarkFromScripts(dom);
        
        if (!watermarkText) {
            return;
        }

        const paragraphElements = Array.from(dom.querySelectorAll("p"));
        const watermarkedParagraphs = paragraphElements.filter(p => 
            p.textContent.includes(watermarkText)
        );
        
        for (const paragraph of watermarkedParagraphs) {
            paragraph.textContent = paragraph.textContent.replace(watermarkText, "");
            const hiddenWatermarkSpan = this.createHiddenWatermarkElement(dom, watermarkText);
            paragraph.appendChild(hiddenWatermarkSpan);
        }
    }

    extractWatermarkFromScripts(dom) {
        const watermarkToken = "original11Content.replace(\"";
        const scriptElements = Array.from(dom.querySelectorAll("script"));
        const watermarkScripts = scriptElements
            .filter(script => script.innerHTML.includes(watermarkToken))
            .map(script => script.innerHTML);
        
        if (watermarkScripts.length === 0) {
            return null;
        }

        const scriptContent = watermarkScripts[0];
        const tokenIndex = scriptContent.indexOf(watermarkToken);
        const watermarkStart = tokenIndex + watermarkToken.length;
        const remainingScript = scriptContent.substring(watermarkStart);
        const watermarkEnd = remainingScript.indexOf("\"");
        
        return remainingScript.substring(0, watermarkEnd);
    }

    createHiddenWatermarkElement(dom, watermarkText) {
        const spanElement = dom.createElement("span");
        spanElement.textContent = watermarkText;
        spanElement.id = "span";
        spanElement.hidden = true;
        return spanElement;
    }
}

class Novel35Parser extends NovelfullParser {
    constructor() {
        super();
    }

    getUrlsOfTocPages(dom) {
        const tocUrls = [];
        const paginationLinks = Array.from(
            dom.querySelectorAll("ul.pagination li a:not([rel])")
        );
        
        if (paginationLinks.length === 0) {
            return tocUrls;
        }

        const lastLink = paginationLinks[paginationLinks.length - 1];
        const lastUrl = new URL(lastLink.href);
        const totalPages = lastUrl.searchParams.get("page");
        
        for (let pageNum = 2; pageNum <= totalPages; pageNum++) {
            lastUrl.searchParams.set("page", pageNum);
            tocUrls.push(lastUrl.href);
        }
        
        return tocUrls;
    }

    findContent(dom) {
        return dom.querySelector("div.chapter-content");
    }

    findChapterTitle(dom) {
        const titleElement = dom.querySelector("div.chapter-title");
        return titleElement ? titleElement.textContent : null;
    }
}

class NovelHyphenBinParser extends NovelfullParser {
    constructor() {
        super();
    }

    removeUnwantedElementsFromContentElement(element) {
        const unwantedElements = Array.from(
            element.querySelectorAll(".novel_online, .unlock-buttons")
        );
        
        for (const unwanted of unwantedElements) {
            const secondSibling = unwanted.nextSibling.nextSibling;
            if (secondSibling) {
                secondSibling.remove();
            }
            unwanted.remove();
        }
        
        super.removeUnwantedElementsFromContentElement(element);
    }
}

class NovelbinParser extends NovelfullParser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        const baseUrl = new URL(dom.baseURI);
        const pathParts = baseUrl.pathname.split("/").filter(segment => segment !== "");
        const novelSlug = pathParts[pathParts.length - 1];
        
        const ajaxUrl = "https://novelbin.com/ajax/chapter-archive?novelId=" + novelSlug;
        const response = await HttpClient.wrapFetch(ajaxUrl);
        const tocDocument = response.responseXML;
        
        return this.extractPartialChapterList(tocDocument);
    }

    removeUnwantedElementsFromContentElement(element) {
        util.removeChildElementsMatchingSelector(element, ".unlock-buttons");
        super.removeUnwantedElementsFromContentElement(element);
    }
}