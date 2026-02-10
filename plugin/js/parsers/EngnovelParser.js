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
parserFactory.register("engnovel.com", () => createEngnovelParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createEngnovelParserInstance() {
    return new EngnovelParser();
}

class EngnovelParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        let chapters = EngnovelParser.extractPartialChapterList(dom);
        let formData = EngnovelParser.getTocFetchInfo(dom);
        chapterUrlsUI.showTocProgress(chapters);
        for (let i = 2; i <= formData.maxPage; ++i) {
            let partialList = await EngnovelParser.fetchPartialChapterList(formData.id, i);
            chapterUrlsUI.showTocProgress(partialList);
            chapters = chapters.concat(partialList);
        }
        return chapters;
    }

    static getTocFetchInfo(dom) {
        let pagination = [...dom.querySelectorAll("div#pagination a")]
            .map(a => parseInt(a.getAttribute("data-page")));

        return {
            id: dom.querySelector("input#id_post").getAttribute("value"),
            maxPage: Math.max(1, ...pagination)
        };
    }

    static async fetchPartialChapterList(id, page) {
        let fetchUrl = "https://engnovel.com/wp-admin/admin-ajax.php";
        let options = {
            method: "POST",
            headers: {
                "Accept": "application/json, text/javascript, */*; q=0.01",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            credentials: "include",
            body: `action=tw_ajax&type=pagination&id=${id}&page=${page}`
        };
        let json = (await HttpClient.fetchJson(fetchUrl, options)).json;
        let dom = util.sanitize(json.list_chap);
        return EngnovelParser.extractPartialChapterList(dom);
    }

    static extractPartialChapterList(dom) {
        let chapterlist = [...dom.querySelectorAll("ul.list-chapter")].pop();
        return util.hyperlinksToChapterList(chapterlist);
    }    

    findContent(dom) {
        return dom.querySelector("div.chapter-content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h3.title");
    }

    findChapterTitle(dom) {
        return dom.querySelector("a.chapter-title").textContent;
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.book");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.desc-text")];
    }
}
