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

parserFactory.register("shanghaifantasy.com", () => createShanghaifantasyParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createShanghaifantasyParserInstance() {
    return new ShanghaifantasyParser();
}

class ShanghaifantasyParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let tocUrl = this.buildTocUrl(dom);
        let json = (await HttpClient.fetchJson(tocUrl)).json;
        return this.buildChapterUrls(json);
    }

    buildTocUrl(dom) {
        let category = dom.querySelector("ul#chapterList")?.getAttribute("data-cat");
        return `https://shanghaifantasy.com/wp-json/fiction/v1/chapters?category=${category}&order=asc&page=1&per_page=10000`;
    }

    buildChapterUrls(json) {
        return json.map(a => ({
            title: a.title,
            sourceUrl: a.permalink 
        }));
    }

    findContent(dom) {
        let content = dom.querySelector("div.contenta");
        let childCount = content.querySelectorAll("div, p").length;
        return (childCount <= 3)
            ? dom.querySelector("body > div.flex")
            : content;
    }

    extractTitleImpl(dom) {
        return dom.querySelector("title")?.textContent ?? null;
    }

    removeUnwantedElementsFromContentElement(element) {
        util.removeChildElementsMatchingSelector(element, ".patreon1, section, nav, button, template, #comments, footer, .hideme");

        for (let e of [...element.querySelectorAll("div")]) {
            e.removeAttribute(":style");
            e.removeAttribute(":class");
            e.removeAttribute("@click.outside");
        }

        super.removeUnwantedElementsFromContentElement(element);
    }

    findChapterTitle(dom) {
        return dom.querySelector("title")?.textContent ?? null;
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, ".flex-col");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div#editdescription")];
    }
}
