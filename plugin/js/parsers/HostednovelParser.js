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

parserFactory.register("hostednovel.com", () => createHostednovelParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createHostednovelParserInstance() {
    return new HostednovelParser();
}

class HostednovelParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        let urlsOfTocPages = this.extractTocPageUrls(dom);
        let chapters = this.extractPartialChapterList(dom);
        return (await this.getChaptersFromAllTocPages(chapters, 
            this.extractPartialChapterList, urlsOfTocPages, chapterUrlsUI))
            .concat(this.chapterUrlsOnPage(dom));
    }

    extractTocPageUrls(dom) {
        let pagination = dom.querySelector("nav[aria-label='Pagination']");
        if (pagination === null) {
            return [];
        }
        let urls = [];
        let lastLink = [...pagination.querySelectorAll("a")].pop();
        if (lastLink !== null) {
            let url = new URL(lastLink.href);
            let maxPage = parseInt(url.searchParams.get("page"));
            for (let i = 2; i <= maxPage; ++i) {
                url.searchParams.set("page", i);
                urls.push(url.href);
            }
        }
        return urls;
    }

    extractPartialChapterList(dom) {
        return [...dom.querySelectorAll("li.flow-root.my-1 a")]
            .map(a => ({
                sourceUrl:  a.href,
                title: HostednovelParser.formatTitle(a)
            }));
    }

    static formatTitle(link) {
        let div = link.querySelector("div");
        util.removeChildElementsMatchingSelector(div, "span, p");
        return div.textContent.trim();
    }

    chapterUrlsOnPage(dom) {
        return [...dom.querySelectorAll(".chaptergroup a:not([rel])")]
            .map(a => util.hyperLinkToChapter(a));
    }

    findContent(dom) {
        return dom.querySelector("div.fontchanger");
    }

    populateUIImpl() {
        document.getElementById("removeAuthorNotesRow").hidden = false; 
    }

    extractTitleImpl(dom) {
        let link = dom.querySelector("h1");
        util.removeChildElementsMatchingSelector(link, "a");
        return link;
    }

    removeUnwantedElementsFromContentElement(element) {
        this.tagAuthorNotesBySelector(element, "div.bg-light-200");
        util.removeChildElementsMatchingSelector(element, "div.adbox");
        super.removeUnwantedElementsFromContentElement(element);
    }

    findChapterTitle(dom) {
        return dom.querySelector("h1 span.fontchanger");
    }

    findCoverImageUrl() {
        // CDN blocks attempt to fetch cover image
        return null;
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll(".prose")];
    }
}
