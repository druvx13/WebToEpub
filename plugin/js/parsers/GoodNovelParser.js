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

parserFactory.register("goodnovel.com", () => createGoodNovelParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createGoodNovelParserInstance() {
    return new GoodNovelParser();
}

class GoodNovelParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        let bookid = GoodNovelParser.extractBookID(dom);
        let tocUrl = new URL(dom.baseURI).origin + "/book_catalog/" + bookid + "/";
        let chapters = [];
        let tocDom = (await HttpClient.wrapFetch(tocUrl + "1")).responseXML;
        let urlsOfTocPages = GoodNovelParser.extractTocPageUrls(tocDom, tocUrl);
        return (await this.getChaptersFromAllTocPages(chapters, 
            this.extractPartialChapterList, urlsOfTocPages, chapterUrlsUI));
    }

    static extractBookID(dom) {
        let url = dom.baseURI;
        let retid = null;
        retid = url.match(new RegExp("_[0-9]+$"))?.[0].match(new RegExp("[0-9]+$"))?.[0];
        if (retid == null) {
            // eslint-disable-next-line
            retid = url.match(new RegExp("book_catalog\/[0-9]+\/"))?.[0].match(new RegExp("[0-9]+"))?.[0];
        }
        return retid;
    }

    static extractTocPageUrls(dom, baseUrl) {
        let max = GoodNovelParser.extractMaxToc(dom);
        let tocUrls = [];
        for (let i = 1; i <= max; ++i) {
            tocUrls.push(`${baseUrl}${i}`);
        }
        return tocUrls;
    }

    static extractMaxToc(dom) {
        let query = [...dom.querySelectorAll("a.pagiation-item")].map(a => parseInt(a.textContent));
        let linkElement = Math.max(...query);
        return (Infinity == linkElement || -Infinity == linkElement) ? 0 : linkElement;
    }

    extractPartialChapterList(dom) {
        let ChapterlistNodes = dom.querySelectorAll(".catalog>div.catalog-box");
        let Chapterlist = [];
        for (let element of ChapterlistNodes) {
            Chapterlist.push(GoodNovelParser.hyperLinkToChapter(element));
        }
        return Chapterlist;
    }

    static hyperLinkToChapter(link, newArc) {
        return {
            sourceUrl:  link.querySelector("a").href,
            title: link.querySelector("a").innerText.trim(),
            newArc: (newArc === undefined) ? null : newArc,
            isIncludeable: GoodNovelParser.isLinkLocked(link)
        };
    }
    
    static isLinkLocked(link) {
        return (link.querySelector(".cat-lock") == null) ? true : false;
    }

    findContent(dom) {
        return dom.querySelector(".read-chapter > .read-content");
    }

    extractTitleImpl(dom) {
        let title = dom.querySelector(".bib_info>h1");
        return title;
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector(".auth > a");
        return authorLabel?.textContent ?? super.extractAuthor(dom);
    }

    findChapterTitle(dom) {
        let title = dom.querySelector("h1.title");
        return title.textContent;
    }

    findCoverImageUrl(dom) {
        return dom.querySelector(".bib_img>img").src;
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.bid_tit, div.bid_p")];
    }

    extractSubject(dom) {
        let tags = [...dom.querySelectorAll(".bid_tit a")];
        return tags.map(e => e.textContent.trim()).join(", ");
    }
    
    extractDescription(dom) {
        return dom.querySelector(".bid_p").textContent.trim();
    }
}
