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

parserFactory.register("asianfanfics.com", () => createAsianfanficsParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createAsianfanficsParserInstance() {
    return new AsianfanficsParser();
}

class AsianfanficsParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let menu = dom.querySelector("aside ul");
        return util.hyperlinksToChapterList(menu);
    }

    findContent(dom) {
        return dom.querySelector("div#user-submitted-body");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1#story-title");
    }

    findChapterTitle(dom) {
        return dom.querySelector("h1#chapter-title");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div#bodyText");
    }

    async fetchChapter(url) {
        let dom = (await HttpClient.fetchHtml(url)).responseXML;
        let postApi = this.findPostApi(dom);
        if (!util.isNullOrEmpty(postApi)) {
            let restUrl = "https://www.asianfanfics.com" + postApi;
            let json = (await HttpClient.fetchJson(restUrl)).json;
            if (!json.post) {
                json = (await HttpClient.fetchJson(restUrl + "?v=1")).json;                
            }
            this.addJsonToContent(json, dom);
        }
        return dom;
    }

    findPostApi(dom) {
        return [...dom.querySelectorAll("script")]
            .filter(s => s.textContent.startsWith("var postApi"))
            .map(s => s.textContent.split("\"")[1])[0];
    }

    addJsonToContent(json, dom) {
        let content = this.findContent(dom);
        let post = util.sanitize("<div>" + json.post + "</div>")
            .querySelector("div");
        content.append(post);
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("#story-description, #story-foreword")];
    }
}
