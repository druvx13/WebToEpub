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

//broken url
parserFactory.register("230book.net", () => create_230BookParserInstance() );
parserFactory.register("38xs.com", () => create_38xsParserInstance() );

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function create_230BookBaseParserInstance() {
    return new _230BookBaseParser();
}

class _230BookBaseParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let menu = dom.querySelector("#list");
        return util.hyperlinksToChapterList(menu);
    }

    findContent(dom) {
        return dom.querySelector("#content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("#info h1").textContent;
    }

    findChapterTitle(dom) {
        return dom.querySelector(".bookname h1");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "#fmimg");
    }

    makeOptions() {
        return ({
            makeTextDecoder: () => new TextDecoder("gbk")
        });
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div#intro")];
    }
}

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function create_230BookParserInstance() {
    return new _230BookParser();
}

class _230BookParser extends _230BookBaseParser {
    constructor() {
        super();
    }

    async fetchChapter(url) {
        // site does not tell us gbk is used to encode text
        return (await HttpClient.wrapFetch(url, this.makeOptions())).responseXML;
    }
}

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function create_38xsParserInstance() {
    return new _38xsParser();
}

class _38xsParser extends _230BookBaseParser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let links = [...dom.querySelectorAll("#list dd a")];
        return this.removeDuplicatesFromFrontOfList(links)
            .map(a => util.hyperLinkToChapter(a));
    }

    removeDuplicatesFromFrontOfList(list) {
        let keys = new Set();
        let filtered = [];
        while (0 < list.length) {
            let item = list.pop();
            if (!keys.has(item.href)) {
                keys.add(item.href);
                filtered.push(item);
            }
        }
        return filtered.reverse();
    }

    async fetchChapter(url) {
        return this.walkPagesOfChapter(url, this.moreChapterTextUrl);
    }

    moreChapterTextUrl(dom) {
        let nextUrl = dom.querySelector("a#pager_next");
        return (nextUrl != null && nextUrl.href.includes("_"))
            ? nextUrl.href
            : null;
    }

}
