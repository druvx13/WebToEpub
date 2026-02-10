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

parserFactory.register("raeitranslations.com", () => createRaeitranslationsParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createRaeitranslationsParserInstance() {
    return new RaeitranslationsParser();
}

class RaeitranslationsParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        return [...dom.querySelectorAll("div.chapter-list a")]
            .map(this.linkToChapter);
    }

    linkToChapter(link) {
        return {
            sourceUrl:  link.href,
            title: link.querySelector(".chapter-title").innerText.trim(),
        };
    }

    findContent(dom) {
        return Parser.findConstrutedContent(dom);
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h2.title");
    }

    findCoverImageUrl(dom) {
        let div = dom.querySelector("div.img.wrapper [style*=background-image]");
        return "https://raeitranslations.com" + util.extractUrlFromBackgroundImage(div);
    }

    async fetchChapter(url) {
        let restUrl = this.makeRestUrl(url);
        let json = (await HttpClient.fetchJson(restUrl)).json;
        let content = this.buildHtml(json.currentChapter);
        let newDoc = Parser.makeEmptyDocForContent(url);
        newDoc.content.appendChild(content);
        return newDoc.dom; 
    }

    makeRestUrl(chapterUrl) {
        let path = new URL(chapterUrl).pathname.split("/");
        let restUrl = new URL("https://api.raeitranslations.com/api/chapters/single");
        restUrl.searchParams.set("id", path[1]);
        restUrl.searchParams.set("num", path[2]);
        return restUrl;
    }

    buildHtml(json) {
        let paragraphs = json.body.replace(/\n/g, "</p><p>");
        let html = `<div><h1>${json.chapTitle}</h1><p>${paragraphs}</p></div>`;
        let doc = util.sanitize(html, "text/html");
        return doc.querySelector("div");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.white-space")];
    }
}
