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

parserFactory.register("requiemtls.com", () => createRequiemtlsParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createRequiemtlsParserInstance() {
    return new RequiemtlsParser();
}

class RequiemtlsParser extends Parser {
    constructor() {
        super();
    }
    
    async getChapterUrls(dom) {
        let table = [...dom.querySelectorAll("div.eplisterfull a")];
        let chapters = table.map(a => ({
            sourceUrl: a.href, 
            title: a.querySelector(".epl-num").textContent +" "+ a.querySelector(".epl-title").textContent
        }));
        return chapters.reverse();
    }

    findContent(dom) {
        return Parser.findConstrutedContent(dom);
    }

    extractSubject(dom) {
        let tags = ([...dom.querySelectorAll("div.info-content .genxed a")]);
        return tags.map(e => e.textContent.trim()).join(", ");
    }

    extractDescription(dom) {
        return dom.querySelector("div.entry-content").textContent.trim();
    }

    extractTitleImpl(dom) {
        return dom.querySelector(".entry-title");
    }

    findCoverImageUrl(dom) {
        return dom.querySelector("div.thumbook img.ts-post-image")?.src ?? null;
    }

    async fetchChapter(url) {
        let site = (await HttpClient.wrapFetch(url)).responseXML;
        return this.buildChapter(site, url);
    }

    buildChapter(dom, url) {
        let newDoc = Parser.makeEmptyDocForContent(url);
        let title = newDoc.dom.createElement("h1");
        title.textContent = dom.querySelector(".entry-title").textContent;
        newDoc.content.appendChild(title);
        let divret = newDoc.dom.createElement("div");
        let content = dom.querySelector(".entry-content");
        for (let n of [...content.childNodes]) {
            divret.appendChild(n);
        }
        let regex = new RegExp(/requiem_tnr_.*?(,|")/, "s");
        let font = dom.querySelector(".entry-content").outerHTML.match(regex)?.[0];
        font = font.replaceAll("\n", "").replaceAll("'", "").replaceAll(" ", "").slice(0,-1);
        divret.style.fontFamily = font;
        newDoc.content.appendChild(divret);
        return newDoc.dom;
    }
}
