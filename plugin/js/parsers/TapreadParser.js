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

parserFactory.register("tapread.com", () => createTapreadParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createTapreadParserInstance() {
    return new TapreadParser();
}

class TapreadParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let chapters = [...dom.querySelectorAll("a.chapter-item")]
            .map(TapreadParser.linkToChapter);
        if (chapters.length == 0) {
            chapters = this.fetchToc(dom.baseURI);
        }
        return chapters;
    }

    static linkToChapter(link) {
        let title = link.querySelector("p");
        title.querySelector("span").remove();
        return ({
            sourceUrl: link.href,
            title: title.textContent
        });
    }

    async fetchToc(url) {
        let bookId = new URL(url).pathname.split("/").pop();
        let body = `bookId=${bookId}`;
        let fetchUrl = "http://www.tapread.com/ajax/book/contents";
        let json = await this.fetchJson(fetchUrl, body);
        return json.result.chapterList.map(j => this.jsonToChapterUrl(j, bookId));
    }

    jsonToChapterUrl(json, bookId) {
        return {
            sourceUrl: `http://www.tapread.com/book/index/${bookId}/${json.chapterId}`,
            title: json.chapterName
        };
    }

    findContent(dom) {
        return Parser.findConstrutedContent(dom);
    }

    extractTitleImpl(dom) {
        return dom.querySelector("div.book-name");
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector("div.author > span.name");
        return (authorLabel === null) ? super.extractAuthor(dom) : authorLabel.textContent;
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.book-img");
    }

    async fetchChapter(url) {
        let parts = new URL(url).pathname.split("/");
        let chapterId = parts.pop();
        let bookId = parts.pop();
        let body = `bookId=${bookId}&chapterId=${chapterId}`;
        let fetchUrl = "http://www.tapread.com/ajax/book/chapter";
        let json = await this.fetchJson(fetchUrl, body);
        return TapreadParser.jsonToHtml(json, fetchUrl);
    }

    async fetchJson(url, body) {
        let options = {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            credentials: "include",
            body: body
        };
        return (await HttpClient.fetchJson(url, options)).json;
    }

    static jsonToHtml(json, fetchUrl) {
        let newDoc = Parser.makeEmptyDocForContent(fetchUrl);
        let header = newDoc.dom.createElement("h1");
        header.textContent = json.result.chapterName;
        newDoc.content.appendChild(header);
        let content = util.sanitize(json.result.content);
        util.moveChildElements(content.body, newDoc.content);
        return newDoc.dom;
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.synopsis p.desc")];
    }
}
