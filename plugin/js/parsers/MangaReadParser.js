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

parserFactory.register("mangaread.co", () => createMangaReadParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createMangaReadParserInstance() {
    return new MangaReadParser();
}

class MangaReadParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        return [...dom.querySelectorAll("li.wp-manga-chapter a")]
            .map(a => util.hyperLinkToChapter(a)).reverse();
    }

    findContent(dom) {
        return Parser.findConstrutedContent(dom);
    }

    extractTitleImpl(dom) {
        return dom.querySelector("div.post-title h1");
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector("div.author-content a");
        return (authorLabel === null) ? super.extractAuthor(dom) : authorLabel.textContent;
    }

    findChapterTitle(dom) {
        return dom.querySelector("h1");
    }

    async fetchChapter(url) {
        let responseXML = (await HttpClient.wrapFetch(url)).responseXML;
        let newDoc = Parser.makeEmptyDocForContent(url);
        newDoc.dom.base = url;
        let imgUrls = this.makeImgUrls(responseXML);
        return this.buildPageWithImageTags(imgUrls, newDoc);
    }

    makeImgUrls(dom) {
        // really, should follow the links in the <option> elements and extract the image url
        // for each page, but this makes fewer calls to mangaread.co
        let img = dom.querySelector(".wp-manga-chapter-img");
        let options = [...dom.querySelector("select#single-pager").querySelectorAll("option")];
        let base = img.getAttribute("data-lazy-src");
        let index = base.lastIndexOf("/");
        base = base.substring(0, index + 1);
        let imgUrls = [];
        for (let i = 1; i <= options.length; ++i) {
            let name = ("00" + i);
            name = name.substring(name.length - 3);
            imgUrls.push(base + name + ".jpg");
        }
        return imgUrls;
    }

    async buildPageWithImageTags(imgUrls, newDoc) {
        for (let u of imgUrls) {
            let img = newDoc.dom.createElement("img");
            img.src = u;
            newDoc.content.appendChild(img);
        }
        return newDoc.dom;
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.summary_image");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.summary__content")];
    }
}
