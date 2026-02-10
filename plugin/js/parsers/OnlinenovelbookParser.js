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
parserFactory.register("onlinenovelbook.com", () => createOnlinenovelbookParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createOnlinenovelbookParserInstance() {
    return new OnlinenovelbookParser();
}

class OnlinenovelbookParser extends WordpressBaseParser {
    constructor() {
        super();
    }

    getChapterUrls(dom, chapterUrlsUI) {
        let paginationUrl = OnlinenovelbookParser.getLastPaginationUrl(dom);
        if (paginationUrl === null) {
            return super.getChapterUrls(dom);
        }
        return this.getChapterUrlsFromMultipleTocPages(dom,
            OnlinenovelbookParser.extractPartialChapterList,
            OnlinenovelbookParser.getUrlsOfTocPages,
            chapterUrlsUI
        ).then(c => c.reverse());
    }

    static getUrlsOfTocPages(dom) {
        let urls = [];
        let paginationUrl = OnlinenovelbookParser.getLastPaginationUrl(dom);
        let maxPage = parseInt(util.extractSubstring(paginationUrl, "/page/", "/"));
        let index = paginationUrl.indexOf("/page/") + 6;
        let prefix = paginationUrl.substring(0, index);
        for (let i = 2; i <= maxPage; ++i) {
            urls.push(prefix + i +"/");
        }
        return urls;
    }

    static getLastPaginationUrl(dom) {
        let urls = [...dom.querySelectorAll("div.ast-pagination a:not(.next)")];
        return (0 === urls.length) ? null : urls.pop().href;
    }

    static extractPartialChapterList(dom) {
        return [...dom.querySelectorAll("h2.entry-title a")]
            .map(a => util.hyperLinkToChapter(a));
    }
}
