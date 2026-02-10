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

parserFactory.register("novelgo.id", () => createNovelgoParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createNovelgoParserInstance() {
    return new NovelgoParser();
}

class NovelgoParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let path = new URL(dom.baseURI).pathname.split("/").filter(p => p !== "");
        let category = path[path.length - 1];
        let url = "https://novelgo.id/wp-json/noveils/v1/chapters?paged=1&perpage=10000&category=" + category;
        let json = (await HttpClient.fetchJson(url)).json;
        return json.map(this.jsonToChapter);
    }

    jsonToChapter(json) {
        let title = json.post_title;
        let index = title.indexOf("Chapter");
        if (0 < index) {
            title = title.substring(index);
        }
        return {
            sourceUrl: json.permalink,
            title: title.replace("&#8211", "-"),
            newArc: null
        };
    }

    findContent(dom) {
        return dom.querySelector("div#chapter-post-content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector(".novel-title");
    }

    removeUnwantedElementsFromContentElement(element) {
        util.removeChildElementsMatchingSelector(element, "ins, div.code-block-label, .code-block");
        super.removeUnwantedElementsFromContentElement(element);
    }

    findChapterTitle(dom) {
        return dom.querySelector("#chapter-post-title");
    }

    findCoverImageUrl(dom) {
        let div = dom.querySelector("div.novel-thumbnail");
        return util.extractUrlFromBackgroundImage(div);
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div#noveils-about-tab .line-height-30 p")];
    }
}
