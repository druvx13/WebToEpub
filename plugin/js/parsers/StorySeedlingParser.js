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

//dead url/ parser
parserFactory.register("storyseedling.com", () => createStorySeedlingParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createStorySeedlingParserInstance() {
    return new StorySeedlingParser();
}

class StorySeedlingParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        return [...dom.querySelectorAll("main .grid.w-full a")]
            .map(link => this.linkToChapter(link));
    }

    linkToChapter(link) {
        let title = link.querySelector(".truncate").textContent;
        return ({
            sourceUrl:  link.href,
            title: title,
        });
    }

    findContent(dom) {
        return (
            dom.querySelector("div.prose .mb-4") || dom.querySelector("#chapter-content")
        );
    }

    populateUIImpl() {
        document.getElementById("removeAuthorNotesRow").hidden = false; 
    }

    preprocessRawDom(webPageDom) {
        let notes = webPageDom.querySelector("div.prose .mb-4:nth-of-type(2)");
        if ((notes != null) && !this.userPreferences.removeAuthorNotes.value) {
            this.tagAuthorNotes([notes]);
            this.findContent(webPageDom).appendChild(notes);
        }
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1");
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector("div.leading-7 a");
        return authorLabel?.textContent ?? super.extractAuthor(dom);
    }

    findChapterTitle(dom) {
        return dom.querySelector(".truncate");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div[x-data='']");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.order-2.mb-4")];
    }

}
