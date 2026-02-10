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

parserFactory.register("readhive.org", () => createReadhiveParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createReadhiveParserInstance() {
    return new ReadhiveParser();
}

class ReadhiveParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        const tab = this.getTab(dom, "releases"); 
        return [...tab.querySelectorAll("a")]
            .map(ReadhiveParser.linkToChapter)
            .reverse();
    }

    static linkToChapter(link) {
        return ({
            sourceUrl:  link.href,
            title: link.querySelector("span.ml-1").textContent.trim(),
        });
    }

    getTab(dom, filter) {
        return [...dom.querySelectorAll("main div[x-show]")]
            .filter(d => d.getAttribute("x-show")?.includes(filter))
            ?.pop();
    }

    findContent(dom) {
        return dom.querySelector("main div.justify-center:not([x-data])");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1");
    }

    findChapterTitle(dom) {
        return dom.querySelector("h1 strong");
    }

    customRawDomToContentStep(chapter, content) {
        for (let e of content.querySelectorAll("div")) {
            let toRemove = [];
            for (let attr of e.attributes) {
                if (attr.name.startsWith("@")) {
                    toRemove.push(attr.name);
                }
            }
            for (let attr of toRemove) {
                e.removeAttribute(attr);
            }
        }
    }

    removeUnwantedElementsFromContentElement(element) {
        util.removeChildElementsMatchingSelector(element, "div[x-data]");
        super.removeUnwantedElementsFromContentElement(element);
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "main");
    }

    getInformationEpubItemChildNodes(dom) {
        const tab = this.getTab(dom, "about"); 
        return tab == null
            ? []
            : [...tab.querySelectorAll("p")];
    }
}
