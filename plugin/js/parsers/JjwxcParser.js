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

parserFactory.register("jjwxc.net", () => createJjwxcParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createJjwxcParserInstance() {
    return new JjwxcParser();
}

class JjwxcParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        return [...dom.querySelectorAll("table.cytable a")]
            .filter(a => this.fixupVip(a))
            .map(a => util.hyperLinkToChapter(a));
    }

    fixupVip(link) {
        let rel = link.getAttribute("rel");
        if (rel) {
            link.href = rel;
        }
        return link.href.includes("onebook")
            ? link
            : null;
    }

    findContent(dom) {
        return dom.querySelector("div.novelbody");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1");
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector("span[itemprop='author']");
        return authorLabel?.textContent ?? super.extractAuthor(dom);
    }

    extractLanguage() {
        return "cn";
    }

    removeUnwantedElementsFromContentElement(element) {
        element.querySelector("#report_box")?.parentElement?.remove();
        util.removeChildElementsMatchingSelector(element, ".readsmall, div[align='right']");
        this.fixupAuthorNote(element);
        for (let div of element.querySelectorAll("div")) {
            div.style = null;
        }
        super.removeUnwantedElementsFromContentElement(element);
    }

    fixupAuthorNote(element) {
        let wrapper = element.querySelector("#note_danmu_wrapper");
        if (wrapper) {
            let note = wrapper.querySelector("#note_str");
            note.setAttribute("style", null);
            let title = document.createElement("div");
            title.innerText = "作者有话说";
            title.appendChild(note);
            wrapper.replaceWith(title);
        }
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.smallreadbody");
    }

    async fetchChapter(url) {
        let options = ({makeTextDecoder: () => new TextDecoder("gb18030")});
        return (await HttpClient.wrapFetch(url, options)).responseXML;
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div#novelintro")];
    }
}
