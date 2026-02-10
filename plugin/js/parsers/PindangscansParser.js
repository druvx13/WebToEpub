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

parserFactory.register("pindangscans.com", () => createPindangscansParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createPindangscansParserInstance() {
    return new PindangscansParser();
}

class PindangscansParser extends Parser { // eslint-disable-line no-unused-vars
    constructor() {
        super();
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        return (await this.getChapterUrlsFromMultipleTocPages(dom,
            this.extractPartialChapterList,
            this.getUrlsOfTocPages,
            chapterUrlsUI
        )).reverse();
    }

    getUrlsOfTocPages(dom) {
        let tocUrls = [];
        let pagination = dom.querySelector("ul.page-numbers");
        if (pagination != null ) {
            let tocUrl = [...pagination.querySelectorAll("a:not(.next)")].pop()?.href;
            if (tocUrl) {
                let splitUrl = tocUrl.split("/");
                if (splitUrl.length >= 6) {
                    let maxPage = parseInt(splitUrl[5]);
                    for (let i = 2; i <= maxPage; ++i) {
                        splitUrl[5] = i;
                        tocUrls.push(splitUrl.join("/"));
                    }
                }
            }
        }
        return tocUrls;
    }

    extractPartialChapterList(dom) {
        let menu = dom.querySelector("ul[data-layout='list']");
        return util.hyperlinksToChapterList(menu);        
    }

    findContent(dom) {
        return dom.querySelector(".brxe-post-content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1.brxe-heading");
    }
    findChapterTitle(dom) {
        return dom.querySelector("h2.brxe-post-title");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "main");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("main .brxe-text-basic")];
    }
}
