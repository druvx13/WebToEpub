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

parserFactory.register("toctruyen.net", () => createToctruyenParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createToctruyenParserInstance() {
    return new ToctruyenParser();
}

class ToctruyenParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        // eslint-disable-next-line
        let regex = new RegExp("\/truyen\/.+");
        let urlpart = dom.baseURI.match(regex)?.[0].slice(8);
        let leaves = urlpart.split("/");
        let id = leaves[0];
        let bookinfo = (await HttpClient.fetchJson("https://toctruyen.net/content/subitems?pid=" + id)).json;
        let chapters = bookinfo.data.e.map(a => ({
            sourceUrl:  a[3],
            title: a[2]  
        }));
        return chapters.reverse();
    }

    findContent(dom) {
        return dom.querySelector(".novel-reading-content .novel-reading-viewport");
    }

    findChapterTitle(dom) {
        return dom.querySelector(".novel-reading-header h2");
    }

    extractTitleImpl(dom) {
        return dom.querySelector(".novel-header h1").textContent;
    }

    extractSubject(dom) {
        let tags = [...dom.querySelectorAll(".detail-genres a")].map(a => a.textContent.trim());
        return tags.join(", ");
    }

    extractDescription(dom) {
        return dom.querySelector("#description").textContent;
    }

    findCoverImageUrl(dom) {
        let test = dom.querySelector(".novel-thumb");
        return test.dataset.original;
    }
}
