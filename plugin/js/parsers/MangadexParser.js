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

parserFactory.register("mangadex.org", () => createMangadexParserInstance());
parserFactory.register("api.mangadex.org", () => createMangadexParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createMangadexParserInstance() {
    return new MangadexParser();
}

class MangadexParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let mangaId = new URL(dom.baseURI).pathname.split("/")[2];
        let feedUrl = new URL(`https://api.mangadex.org/manga/${mangaId}/feed`);
        feedUrl.searchParams.set("translatedLanguage[]", "en");
        let json = (await HttpClient.fetchJson(feedUrl.href)).json;
        return json.data.map(this.buildChapterInfo);
    }

    buildChapterInfo(json) {
        let title = "";
        let attributes = json.attributes;
        if (attributes.volume) {
            title = "Volume: " + attributes.volume + " ";
        }
        if (attributes.chapter) {
            title += "Chapter: " + attributes.chapter + " ";
        }
        if (attributes.title) {
            title += attributes.title;
        }
        return ({
            title: title.trim(),
            sourceUrl: `https://api.mangadex.org/at-home/server/${json.id}`
        });
    }

    extractTitleImpl(dom) {
        return dom.querySelector(".title p");
    }

    findContent(dom) {
        return Parser.findConstrutedContent(dom);
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "[style='grid-area: art;']");
    }
    
    async fetchChapter(url) {
        let options = { };
        let json = (await HttpClient.fetchJson(url, options)).json;
        return MangadexParser.jsonToHtmlWithImgTags(url, json);
    }

    static jsonToHtmlWithImgTags(pageUrl, json) {
        let newDoc = Parser.makeEmptyDocForContent(pageUrl);
        let baseUrl = json.baseUrl + "/data/" + json.chapter.hash + "/";
        for (let data of json.chapter.data) {
            let img = newDoc.dom.createElement("img");
            img.src = baseUrl + data;
            newDoc.content.appendChild(img);
        }
        return newDoc.dom;
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.md-md-container")]
            .filter(row => (row.querySelector("img, button") === null));
    }
}
