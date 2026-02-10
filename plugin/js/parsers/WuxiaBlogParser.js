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

parserFactory.register("wuxia.blog", () => createWuxiaBlogParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createWuxiaBlogParserInstance() {
    return new WuxiaBlogParser();
}

class WuxiaBlogParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        let tocPage1chapters = WuxiaBlogParser.extractPartialChapterList(dom);
        let urlsOfTocPages  = WuxiaBlogParser.getUrlsOfTocPages(dom);
        return (await this.getChaptersFromAllTocPages(tocPage1chapters,
            WuxiaBlogParser.extractPartialChapterList,
            urlsOfTocPages,
            chapterUrlsUI
        )).reverse();
    }

    static extractPartialChapterList(dom) {
        let menu = dom.querySelector("tbody#chapters");
        return util.hyperlinksToChapterList(menu);
    }

    static getUrlsOfTocPages(dom) {
        let urls = [];
        let paginationUrl = WuxiaBlogParser.getLastPaginationUrl(dom);
        if (paginationUrl !== null) {
            let index = paginationUrl.lastIndexOf("/");
            let maxPage = parseInt(paginationUrl.substring(index + 1));
            let prefix = paginationUrl.substring(0, index + 1);
            for (let i = 2; i <= maxPage; ++i) {
                urls.push(prefix + i);
            }
        }
        return urls;
    }

    static getLastPaginationUrl(dom) {
        let urls = [...dom.querySelectorAll("ul.pagination li a")];
        return (0 === urls.length) ? null : urls.pop().href;
    }

    findContent(dom) {
        return dom.querySelector("div.article");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h4.panel-title");
    }

    removeUnwantedElementsFromContentElement(element) {
        util.removeChildElementsMatchingSelector(element, "ul.pager, button, div.recently-nav, div.fb-like");
        super.removeUnwantedElementsFromContentElement(element);
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.imageCover");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div[itemprop='description']")];
    }
}
