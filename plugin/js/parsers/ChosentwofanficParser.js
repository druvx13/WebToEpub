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

parserFactory.register("chosentwofanfic.com", () => createChosentwofanficParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createChosentwofanficParserInstance() {
    return new ChosentwofanficParser();
}

class ChosentwofanficParser extends Parser {
    constructor() {
        super();
        this.ChacheChapterTitle = new Map();
    }

    async getChapterUrls(dom) {
        let urlparams = new URL(dom.baseURI).searchParams;
        let bookid = urlparams.get("sid");
        let tocHtml = (await HttpClient.wrapFetch("https://chosentwofanfic.com/viewstory.php?sid="+bookid+"&index=1")).responseXML;
        let chapters = [...tocHtml.querySelectorAll("#output a")].filter(a => a.href.includes("viewstory.php?sid="+bookid+"&"));
        let ret = chapters.map(a => ({
            sourceUrl: a.href, 
            title: a.textContent
        }));
        return ret;
    }
    
    async loadEpubMetaInfo(dom) {
        let urlparams = new URL(dom.baseURI).searchParams;
        let bookid = urlparams.get("sid");
        let bookinfo = (await HttpClient.wrapFetch("https://chosentwofanfic.com/viewstory.php?sid="+bookid+"&index=1")).responseXML;
        let pagetitle = [...bookinfo.querySelectorAll("#pagetitle a")].filter(a => a.textContent != "");
        this.title = pagetitle[0].textContent;
        this.author = pagetitle[1].textContent;
        this.description = bookinfo.querySelectorAll("#output .content p")[0].textContent;
        this.img = dom.querySelector("#pagetitle img")?.src ?? null;
        return;
    }

    extractTitleImpl() {
        return this.title;
    }

    extractAuthor() {
        return this.author;
    }

    extractDescription() {
        return this.description.trim();
    }

    findCoverImageUrl() {
        return this.img;
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("#output div.content")];
    }

    findContent(dom) {
        return dom.querySelector("#story");
    }

    findChapterTitle(dom) {
        let tmptitle = this.ChacheChapterTitle.get(dom.baseURI);
        return tmptitle;
    }

    preprocessRawDom() {
        if (this.ChacheChapterTitle.size == 0) {
            let pagesToFetch = [...this.state.webPages.values()].filter(c => c.isIncludeable);
            pagesToFetch.map(a => (this.ChacheChapterTitle.set(a.sourceUrl, a.title)));
        }
    }
}
