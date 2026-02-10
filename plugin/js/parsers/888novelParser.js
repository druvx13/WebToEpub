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
parserFactory.register("888novel.com", () => create_888novelParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function create_888novelParserInstance() {
    return new _888novelParser();
}

class _888novelParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        return this.getChapterUrlsFromMultipleTocPages(dom,
            _888novelParser.extractPartialChapterList,
            _888novelParser.getUrlsOfTocPages,
            chapterUrlsUI
        );
    }

    static getUrlsOfTocPages(dom) {
        let pagination = dom.querySelector("ul.pagination");
        let tocUrls = [];
        if (pagination != null ) {
            let tocLinks = [...pagination.querySelectorAll("a")]
                .filter(a => a.textContent !== "»");
            if (0 < tocLinks.length) {
                let maxPageUrl = tocLinks.pop().href;
                let index = maxPageUrl.lastIndexOf("/", maxPageUrl.length - 2);
                let base = maxPageUrl.substring(0, index + 1);
                let maxPage = parseInt(maxPageUrl.substring(index + 1).replace("#dsc", ""));
                if (1 < maxPage) {
                    for (let i = 2; i <= maxPage; ++i) {
                        tocUrls.push(`${base}${i}/`);
                    }
                }
            }
        }
        return tocUrls;
    }

    static extractPartialChapterList(dom) {
        let menu = dom.querySelector("#dsc ul.listchap");
        return util.hyperlinksToChapterList(menu);
    }

    findContent(dom) {
        return dom.querySelector("div.reading");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1");
    }

    findChapterTitle(dom) {
        return dom.querySelector("h2");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, ".book3d");
    }

    getInformationEpubItemChildNodes(dom) {
        let nodes = [...dom.querySelectorAll("div.tabs1")];
        for (let n of nodes) {
            n.setAttribute("style", null);
        }
        return nodes;
    }
}
