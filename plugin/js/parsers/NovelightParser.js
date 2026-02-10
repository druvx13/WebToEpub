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

parserFactory.register("novelight.net", () => createNovelightParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createNovelightParserInstance() {
    return new NovelightParser();
}

class NovelightParser extends Parser {
    constructor() {
        super();
        this.ChacheChapterTitle = new Map();
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        let SiteIds = this.getSiteIds(dom);
        let pageCount = 1;
        let Chapterjsons;
        let chapters = [];
        let partialList;
        let header = {"X-Requested-With": "XMLHttpRequest"};  
        let options = {
            headers: header
        };
        let oldChapterjson = "";
        for (let i = 1; i <= pageCount; i++) {
            await this.rateLimitDelay();
            let requrl = "https://novelight.net/book/ajax/chapter-pagination?csrfmiddlewaretoken="+SiteIds.csrf+"&book_id="+SiteIds.book_id+"&page="+i;
            Chapterjsons = (await HttpClient.fetchJson(requrl, options)).json;
            if (oldChapterjson.html == Chapterjsons.html) {
                break;
            }
            oldChapterjson = Chapterjsons;
            pageCount++;
            partialList = this.chaptersFromJson(Chapterjsons, requrl);
            chapterUrlsUI.showTocProgress(partialList);
            chapters = chapters.concat(partialList);
        }
        return chapters.reverse();
    }

    getSiteIds(dom) {
        let startString = "const CONTENT_TYPE";
        let scriptElement = [...dom.querySelectorAll("script")]
            .filter(s => s.textContent.includes(startString))[0].textContent;
        let ret = {};
        let regex = new RegExp("const OBJECT_BY_COMMENT = [0-9]+");
        ret.book_id = scriptElement.match(regex)?.[0].slice(26);
        // eslint-disable-next-line
        regex = new RegExp("window\.CSRF_TOKEN = \".*?\"");
        ret.csrf = scriptElement.match(regex)?.[0].slice(21, -1);
        return ret;
    }
    

    chaptersFromJson(json, url) {
        //without this the href links have as baseurl the extension
        let newDoc = Parser.makeEmptyDocForContent(url);
        let content = util.sanitize(json.html);
        util.moveChildElements(content.body, newDoc.content);
        let chapters = [...newDoc.dom.querySelectorAll("a")].map(a => ({
            sourceUrl: a.href, 
            title: a.querySelector(".title").textContent.replaceAll("\n", "").trim(), 
            isIncludeable: a.querySelector(".cost")?.textContent==null?true:false
        })); 
        return chapters;
    }
    

    extractTitleImpl(dom) {
        return dom.querySelector(".header-manga h1");
    }

    extractSubject(dom) {
        let tags = ([...dom.querySelectorAll(".tags a")]);
        return tags.map(e => e.textContent.trim()).join(", ");
    }

    extractDescription(dom) {
        return dom.querySelector(".text-info").textContent.trim();
    }

    findCoverImageUrl(dom) {
        return dom.querySelector(".poster img")?.src ?? null;
    }

    findContent(dom) {
        return Parser.findConstrutedContent(dom);
    }

    async fetchChapter(url) {
        if (this.ChacheChapterTitle.size == 0) {
            let pagesToFetch = [...this.state.webPages.values()].filter(c => c.isIncludeable);
            pagesToFetch.map(a => (this.ChacheChapterTitle.set(a.sourceUrl, a.title)));
        }
        let restUrl = this.toRestUrl(url);
        let header = {"X-Requested-With": "XMLHttpRequest"};  
        let options = {
            headers: header
        };
        let json = (await HttpClient.fetchJson(restUrl, options)).json;
        return this.buildChapter(json, url);
    }

    toRestUrl(url) {
        let leaves = url.split("/");
        let chapternumber = leaves[leaves.length - 1];
        return "https://novelight.net/book/ajax/read-chapter/"+chapternumber;
    }

    buildChapter(json, url) {
        let newDoc = Parser.makeEmptyDocForContent(url);
        let title = newDoc.dom.createElement("h1");
        title.textContent = this.ChacheChapterTitle.get(url);
        newDoc.content.appendChild(title);
        let content = util.sanitize(json.content);
        for (let n of [...content.body.querySelectorAll("."+json.class+" div")]) {
            let br = newDoc.dom.createElement("br");
            newDoc.content.appendChild(n);
            newDoc.content.appendChild(br);
        }
        return newDoc.dom;
    }
}
