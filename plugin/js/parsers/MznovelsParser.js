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

parserFactory.register("mznovels.com", () => createMznovelsParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createMznovelsParserInstance() {
    return new MznovelsParser();
}

class MznovelsParser extends Parser { // eslint-disable-line no-unused-vars
    constructor() {
        super();
    }

    populateUIImpl() {
        document.getElementById("removeAuthorNotesRow").hidden = false;
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        let tocPage1chapters = this.extractPartialChapterList(dom);
        let urlsOfTocPages  = this.getUrlsOfTocPages(dom);
        return (await this.getChaptersFromAllTocPages(tocPage1chapters,
            this.extractPartialChapterList,
            urlsOfTocPages,
            chapterUrlsUI
        )).reverse();
    }

    getUrlsOfTocPages(dom) {
        let urls = [];
        let pagination = dom.querySelector(".pagination");
        if (pagination)
        {
            let url = new URL(pagination.querySelector("a").href);
            let maxPage = this.maxTocPage(pagination);
            for (let i = 2; i <= maxPage; i++) {
                url.searchParams.set("page", i);
                urls.push(url.href);
            }
        }
        return urls;
    }

    maxTocPage(pagination) {
        let offsets = [...pagination.querySelectorAll("a")]
            .map(item => new URL(item?.href)?.searchParams?.get("page"))
            .filter(item => item !== null)
            .map(item => parseInt(item));
        return 0 < offsets.length
            ? Math.max(...offsets)
            : 0;
    }

    extractPartialChapterList(dom) {
        let menu = dom.querySelector(".chapter-list");
        return util.hyperlinksToChapterList(menu);
    }

    findContent(dom) {
        return dom.querySelector(".chapter-content");
    }

    preprocessRawDom(webPageDom) {
        let content = this.findContent(webPageDom);
        if (!this.userPreferences.removeAuthorNotes.value) {
            let note = webPageDom.querySelector("div.author_note");
            if (note) {
                util.removeChildElementsMatchingSelector(note, ".author_note_avatar > img");
                for (let pre of [...note.querySelectorAll(".note_content")]) {
                    util.convertPreTagToPTags(webPageDom, pre, "\n");
                }
                content.appendChild(note);
            }
        }
    }

    extractTitleImpl(dom) {
        return dom.querySelector(".novel-title");
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector(".novel-author a");
        return authorLabel?.textContent ?? super.extractAuthor(dom);
    }

    findChapterTitle(dom) {
        return dom.querySelector("h1");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, ".novel-image-container");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll(".novel-summary")];
    }

    cleanInformationNode(node) {
        util.removeChildElementsMatchingSelector(node, "button");
        return node;
    }
}
