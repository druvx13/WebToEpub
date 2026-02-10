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
parserFactory.register("novel.naver.com", () => createNovelNaverParserInstance());

class NovelNaverImageCollector extends ImageCollector {
    constructor() {
        super();
    }

    //  Ignore address of hyperlink that wraps an image tag
    extractWrappingUrl(element) {
        let tagName = element.tagName.toLowerCase();
        let img = (tagName === "img")
            ? element
            : element.querySelector("img");
        return img.src;
    }
}

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createNovelNaverParserInstance() {
    return new NovelNaverParser();
}

class NovelNaverParser extends Parser {
    constructor() {
        super(new NovelNaverImageCollector());
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        let chapters = this.extractPartialChapterList(dom);
        let urlsOfTocPages = await this.extractTocPageUrls(dom);
        return (await this.getChaptersFromAllTocPages(chapters, 
            this.extractPartialChapterList, urlsOfTocPages, chapterUrlsUI));
    }

    async extractTocPageUrls(dom) {
        let found = new Set();
        let urls = this.extractPartialTocPages(dom, found);
        let nextTocPageUrl = null;
        while ((nextTocPageUrl = dom.querySelector("div.default_paging a.ico_next")?.href) != null) {
            dom = (await HttpClient.wrapFetch(nextTocPageUrl)).responseXML;
            urls = urls.concat(this.extractPartialTocPages(dom, found));
        }
        return urls;
    }

    extractPartialTocPages(dom, found) {
        let urls = [...dom.querySelectorAll("div.default_paging a")]
            .map(l => l.href)
            .filter(u => !found.has(u));
        for (let u of urls) {
            found.add(u);
        }
        return urls;
    }

    extractPartialChapterList(dom) {
        let menu = dom.querySelector("div.cont_sub > ul.list_type2");
        return [...menu.querySelectorAll("a")]
            .map(a => ({
                sourceUrl:  a.href,
                title: a.querySelector("p.subj").textContent.trim()
            }));
    }

    findContent(dom) {
        return dom.querySelector("div.viewer_container");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h2.book_title");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.section_area_info");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("#summaryText")];
    }
}
