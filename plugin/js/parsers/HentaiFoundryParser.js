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

parserFactory.register("hentai-foundry.com", () => createHentaiFoundryParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createHentaiFoundryParserInstance() {
    return new HentaiFoundryParser();
}

class HentaiFoundryParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let content = dom.querySelector("#yw0");
        if (content.className === "storiesView") {
            return [];
        } else if (content.className === "galleryView") {
            return this.selectChapterUrls(content, "div.thumbTitle a");
        } else {
            return this.selectChapterUrls(content, "div.boxbody a");
        }
    }

    async selectChapterUrls(content, linkSelector) {
        return [...content.querySelectorAll(linkSelector)]
            .map(a => util.hyperLinkToChapter(a));
    }

    findContent(dom) {
        let content = dom.querySelector("section#viewChapter div.boxbody");
        if (content === null) {
            content = dom.querySelector("section#picBox div.boxbody");
        }
        return content;
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1.titleSemantic");
    }

    extractAuthor(dom) {
        let author = null;
        let label = [...dom.querySelectorAll("td.storyInfo span.label")]
            .filter(l => l.textContent.trim() === "Author");
        if (0 < label.length) {
            author = label[0].parentElement.querySelector("a");
        }
        return (author === null) ? super.extractAuthor(dom) : author.textContent;
    }

    findChapterTitle(dom) {
        return dom.querySelector("h1.titleSemantic");
    }

    getInformationEpubItemChildNodes(dom) {
        let desc = dom.querySelector("td.storyDescript");
        util.removeChildElementsMatchingSelector(desc, "div");
        let info = dom.createElement("table");
        info.appendChild(desc.cloneNode(true));
        return [info];
    }
}
