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

parserFactory.register("mtlnovels.com", () => createMtlnovelsParserInstance());
parserFactory.register("mtlnovel.com", () => createMtlnovelsParserInstance());
parserFactory.registerUrlRule(
    url => (util.extractHostName(url).endsWith(".mtlnovels.com")),
    () => createMtlnovelsParserInstance()
);
parserFactory.registerUrlRule(
    url => (util.extractHostName(url).endsWith(".mtlnovel.com")),
    () => createMtlnovelsParserInstance()
);

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createMtlnovelsParserInstance() {
    return new MtlnovelsParser();
}

class MtlnovelsParser extends Parser {
    constructor() {
        super();
    }

    populateUIImpl() {
        document.getElementById("removeOriginalRow").hidden = false;
    }

    async getChapterUrls(dom) {
        const tocUrl = dom.querySelector("#panelchapterlist > a").href;

        const chapterDom = (await HttpClient.fetchHtml(tocUrl)).responseXML;

        return [...chapterDom.querySelectorAll(".ch-list > p > a")]
            .map(a => ({
                title: a.textContent.trim(),
                sourceUrl: a.href
            }))
            .reverse();
    }

    findContent(dom) {
        return dom.querySelector("div.single-page");
    }

    extractTitleImpl(dom) {
        return dom.querySelector(".entry-title");
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector("#author");
        return (authorLabel === null) ? super.extractAuthor(dom) : authorLabel.textContent;
    }

    removeUnwantedElementsFromContentElement(element) {
        let original = "";
        if (this.userPreferences.removeOriginal.value) {
            original = ", p.cn";
        }
        util.removeChildElementsMatchingSelector(element, ".crumbs, .chapter-nav, .lang-btn, .sharer," +
            " amp-embed, .link-title, ol.link-box, a.view-more, button, span[hidden]" + original);
        for (let e of [...element.querySelectorAll("div")]) {
            e.removeAttribute("[class]");
        }
        super.removeUnwantedElementsFromContentElement(element);
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div#panelnovelinfo div.desc")];
    }
}
