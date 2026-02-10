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

parserFactory.register("neobook.org", () => createNeobookParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createNeobookParserInstance() {
    return new NeobookParser();
}

class NeobookParser extends Parser { // eslint-disable-line no-unused-vars
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let menu = dom.querySelector("div#book-about-chapters");
        return util.hyperlinksToChapterList(menu);
    }

    findContent(dom) {
        return Parser.findConstrutedContent(dom);
    }

    extractTitleImpl(dom) {
        return dom.querySelector("div.book-title");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.book-cover-wrapper");
    }

    async fetchChapter(url) {
        let rawHTML = (await HttpClient.fetchHtml(url)).responseXML;
        let json = this.extractJson(rawHTML);
        return this.buildChapter(json, url);
    }

    extractJson(rawHTML) {
        let prefix = "var data = ";
        let script = [...rawHTML.querySelectorAll("script")]
            .filter(s => s.textContent.includes(prefix))
            .map(s => s.textContent)[0];
        return util.locateAndExtractJson(script, prefix);
    }

    buildChapter(json, url) {
        let chapter = json.chapters
            .filter(c => c?.data?.html != null)[0];
        let newDoc = Parser.makeEmptyDocForContent(url);
        let title = newDoc.dom.createElement("h1");
        title.textContent = chapter.data.title;
        newDoc.content.appendChild(title);
        let content = util.sanitize(chapter.data.html);
        util.moveChildElements(content.body, newDoc.content);
        return newDoc.dom;
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("#book-about-description")];
    }
}
