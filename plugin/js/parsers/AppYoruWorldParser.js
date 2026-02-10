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

parserFactory.register("app.yoru.world", () => createAppYoruWorldParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createAppYoruWorldParserInstance() {
    return new AppYoruWorldParser();
}

class AppYoruWorldParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        // eslint-disable-next-line
        let regex = new RegExp("\/story\/[0-9]+");
        let bookid = dom.baseURI.match(regex)?.[0].slice(7);
        let data = (await HttpClient.fetchJson("https://pxp-main-531j.onrender.com/api/v1/books/" + bookid)).json;
        let notInclude = data.paywall.first_n_chapters;
        let ChapterArray = data.chapters;
        let ChapterArrayFree = ChapterArray.map(a => ({
            sourceUrl: "https://app.yoru.world/en/story/"+bookid+"/read/" + a.id, 
            title: a.title,
            isIncludeable: (a.number <= notInclude || notInclude == null)
        }));
        return ChapterArrayFree.reverse();
    }
    
    async loadEpubMetaInfo(dom) {
        // eslint-disable-next-line
        let regex = new RegExp("\/story\/[0-9]+");
        let bookid = dom.baseURI.match(regex)?.[0].slice(7);
        let bookinfo = (await HttpClient.fetchJson("https://pxp-main-531j.onrender.com/api/v1/books/" + bookid)).json;
        this.title = bookinfo.title;
        this.author = bookinfo.author.display_name;
        this.tags = bookinfo.tags.map(a => a.name);
        this.description = bookinfo.summary;
        this.img = (await HttpClient.fetchJson("https://pxp-main-531j.onrender.com/api/v1/aws/s3/"+bookinfo.cover.id+":sign_get")).json;
        return;
    }

    findContent(dom) {
        return Parser.findConstrutedContent(dom);
    }

    extractTitleImpl() {
        return this.title;
    }

    extractAuthor() {
        return this.author;
    }

    extractSubject() {
        let tags = this.tags;
        return tags.join(", ");
    }

    extractDescription() {
        return this.description.trim();
    }

    findCoverImageUrl() {
        return this.img;
    }

    async fetchChapter(url) {
        let restUrl = this.toRestUrl(url);
        let documenturl = (await HttpClient.fetchJson(restUrl)).json;
        let rawHTML = (await HttpClient.fetchHtml(documenturl)).responseXML;
        return this.buildChapter(rawHTML, url);
    }

    toRestUrl(url) {
        let regex = new RegExp("[0-9]+$");
        let id = url.match(regex)[0];
        return "https://pxp-main-531j.onrender.com/api/v1/book_chapters/"+id+"/content";
    }

    buildChapter(rawHTML, url) {
        let newDoc = Parser.makeEmptyDocForContent(url);
        newDoc.content.appendChild(rawHTML.body);
        return newDoc.dom;
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("#about-panel.synopsis")];
    }

    addTitleToContent(webPage, content) {
        let h2 = webPage.rawDom.createElement("h2");
        h2.innerText = webPage.title.trim();
        content.prepend(h2);
    }
}
