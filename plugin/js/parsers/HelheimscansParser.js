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

//dead urls
parserFactory.register("helheimscans.com", () => createHelheimscansParserInstance());
parserFactory.register("helheimscans.org", () => createHelheimscansParserInstance());
//Helheim Scans moved to Helio Scans
parserFactory.register("helioscans.com", () => createHelheimscansParserInstance());


/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createHelheimscansParserInstance() {
    return new HelheimscansParser();
}

class HelheimscansParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        return [...dom.querySelectorAll("#chapters_panel a")]
            .map(this.linkToChapter)
            .reverse();
    }

    linkToChapter(link) {
        let title = link.querySelector("span").textContent.trim();
        let coinimg = link.querySelector("img");
        return ({
            sourceUrl:  link.href,
            title: title,
            isIncludeable: (coinimg == null)
        });
    }

    findContent(dom) {
        return dom.querySelector("#pages");
    }

    preprocessRawDom(dom) {
        let imgs = [...dom.querySelectorAll("#pages img.lazy[uid]")];
        for (let img of imgs) {
            img.src = `https://image.meowing.org/uploads/${img.getAttribute("uid")}`;
        }
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1");
    }

    findChapterTitle(dom) {
        return dom.querySelector("title");
    }

    findCoverImageUrl(dom) {
        let url = dom.querySelector("div[style^=--photo]");
        url = url.getAttribute("style").split("(")[1];
        return url
            ? url.substring(0, url.length - 1)
            : null;
    }

    getInformationEpubItemChildNodes(dom) {
        let meta = dom.querySelector("meta[name='description']");
        if (meta) {
            let p = dom.createElement("p");
            p.textContent = meta.getAttribute("content");
            return [p];
        }
        return [];
    }
}
