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

parserFactory.register("inoveltranslation.com", () => createInoveltranslationParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createInoveltranslationParserInstance() {
    return new InoveltranslationParser();
}

class InoveltranslationParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        return [...dom.querySelectorAll("section[class^='styles_chapter_list'] div:has(>a):not(:has(> div))")]
            .map(link => this.linkToChapter(link)).reverse();
    }

    linkToChapter(link) {
        let a = link.querySelector("a");

        return ({
            sourceUrl: a.href,
            title: a.textContent,
        });
    }

    findContent(dom) {
        return dom.querySelector("section[data-sentry-component='RichText']");
    }

    preprocessRawDom(webPageDom) {
        // notes can preceed content.  Move them into content
        let notes = [...webPageDom.body.querySelectorAll("div.rounded-xl")];
        if (0 < notes.length) {
            notes.forEach(n => n.remove());
            let content = this.findContent(webPageDom);
            let footnoteTitle = webPageDom.createElement("h2");
            footnoteTitle.appendChild(webPageDom.createTextNode("Author Notes"));
            content.appendChild(footnoteTitle);
            notes.forEach(n => content.appendChild(n));
        }
    }

    findChapterTitle(dom) {
        return dom.querySelector("h1");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "article");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("section[class^='styles_details_container'] dl:last-child")];
    }
}
