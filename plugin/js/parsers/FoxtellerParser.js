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

parserFactory.register("foxteller.com", () => createFoxtellerParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createFoxtellerParserInstance() {
    return new FoxtellerParser();
}

class FoxtellerParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        return [...dom.querySelectorAll(".card li a")]
            .map(link => util.hyperLinkToChapter(link));
    }

    findContent(dom) {
        return Parser.findConstrutedContent(dom);
    }

    extractTitleImpl(dom) {
        return dom.querySelector("div.novel-title h2");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "figure.novel-featureimg");
    }

    async fetchChapter(url) {
        let chapterDom = (await HttpClient.wrapFetch(url)).responseXML;
        let content = (await this.fetchContentForChapter(chapterDom));
        let newDoc = Parser.makeEmptyDocForContent(url);
        let header = newDoc.dom.createElement("h1");
        header.textContent = chapterDom.querySelector("div.page-header h3").textContent;
        newDoc.content.appendChild(header);
        newDoc.content.appendChild(content.querySelector("article"));
        return newDoc.dom;        
    }

    async fetchContentForChapter(dom) {
        let novelRegex = /.*?novel_id'\s?:\s?'([\w\s]+)'/i;
        let chapRegex = /.*?chapter_id'\s?:\s?'([\w\s]+)'/i;

        let html = dom.head.innerText;
        let storyID = html.match(novelRegex)[1];
        let chapterID = html.match(chapRegex)[1];
        let options = {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({x1: storyID, x2: chapterID})
        };
        let json = (await HttpClient.fetchJson("https://www.foxteller.com/aux_dem", options)).json;
        let decoded = this.decodeFoxteller(json);
        let rawHtml = "<article>" + decoded + "</article>";
        return util.sanitize(rawHtml);
    }

    decodeFoxteller(json) {
        var n = json.aux.replace(/%Ra&/g, "A").replace(/%Rc&/g, "B").replace(/%Rb&/g, "C").replace(/%Rd&/g, "D").replace(/%Rf&/g, "E").replace(/%Re&/g, "F");
        return decodeURIComponent(Array.prototype.map.call(atob(n), function(e) {
            return "%" + ("00" + e.charCodeAt(0).toString(16)).slice(-2);
        }).join(""));   
    }    

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.novel-description")];
    }
}
