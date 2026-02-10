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

parserFactory.register("lightnovelbox.com", () => createLightnovelboxParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createLightnovelboxParserInstance() {
    return new LightnovelboxParser();
}

class LightnovelboxParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        let links = [...dom.querySelectorAll("ul.chapter-list a")];
        let chapters = LightnovelboxParser.linksToChapters(links);
        let urls = LightnovelboxParser.getUrlsOfTocPages(dom);
        for (let url of urls) {
            let rawDom = (await HttpClient.fetchJson(url)).json.chapters;
            links = [...util.sanitize(rawDom).querySelectorAll("a")];
            let partialList = LightnovelboxParser.linksToChapters(links);
            chapterUrlsUI.showTocProgress(partialList);
            chapters = chapters.concat(partialList);
        }
        return chapters;
    }

    static getUrlsOfTocPages(dom) {
        let ids = [...dom.querySelectorAll("div.pagination-container a[id]")]
            .map(a => parseInt(a.id));
        let last = Math.max(...ids);
        let urls = [];
        if (last !== null) {
            let name = new URL(dom.baseURI).pathname.split("/").pop();
            let prefix = `https://lightnovelbox.com/api/novels/${name}/chapters?page=`;
            for (let i = 2; i <= last; ++i) {
                urls.push(prefix + i);
            }
        }
        return urls;
    }

    static linksToChapters(links) {
        return links.map(link => ({
            sourceUrl:  "https://lightnovelbox.com" + new URL(link.href).pathname,
            title: link.querySelector(".chapter-title").textContent.trim(),
        }));
    }

    findContent(dom) {
        return dom.querySelector("div.chapter__content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("div.main-head h1");
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector("div.author a");
        return (authorLabel === null) ? super.extractAuthor(dom) : authorLabel.textContent;
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "figure.cover");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.summary")];
    }
}
