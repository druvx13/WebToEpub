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

parserFactory.register("wtnovels.com", () => createWtnovelsParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createWtnovelsParserInstance() {
    return new WtnovelsParser();
}

class WtnovelsParser extends WordpressBaseParser { // eslint-disable-line no-unused-vars
    constructor() {
        super();
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        let tocPage1chapters = this.extractPartialChapterList(dom);
        let urlsOfTocPages  = this.getUrlsOfTocPages(dom);
        return (await this.getChaptersFromAllTocPages(tocPage1chapters,
            this.extractPartialChapterList,
            urlsOfTocPages,
            chapterUrlsUI
        )).reverse();
    }

    extractPartialChapterList(dom) {
        return [...dom.querySelectorAll("div.chapters-list a")]
            .map(link => ({
                sourceUrl: link.href,
                title: link.querySelector("h3").textContent,
                isIncludeable: link.querySelector(".chapter-paid-points") == null
            }));
    }

    getUrlsOfTocPages(dom) {
        let tocUrls = [];
        let link = [...dom.querySelectorAll("nav.cgl-pagination a.cgl-page")].pop()?.href;
        if (link) {
            let splitUrl = link.split("/");
            if (splitUrl.length >= 7) {
                let maxPage = parseInt(splitUrl[6]);
                for (let i = 2; i <= maxPage; ++i) {
                    splitUrl[6] = i;
                    tocUrls.push(splitUrl.join("/"));
                }
            }
        }
        return tocUrls;
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1.novel-title");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, ".novel-header");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll(".novel-summary-initial")];
    }
}
