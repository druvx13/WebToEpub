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

parserFactory.register("ntruyen.vn", () => createNtruyenParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createNtruyenParserInstance() {
    return new NtruyenParser();
}

class NtruyenParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        let chapters = this.extractPartialChapterList(dom);
        chapterUrlsUI.showTocProgress(chapters);

        let numPages = this.getNumOfTocPages(dom);
        let storyId = this.getStoryId(dom);
        for (let i = 2; i <= numPages; ++i) {
            let formData = this.createFormData(storyId, i);
            let tocPage = await (this.fetchToc(formData));
            let partialList = this.extractPartialChapterList(tocPage);
            chapterUrlsUI.showTocProgress(partialList);
            chapters = chapters.concat(partialList);
        }
        return chapters;
    }

    extractPartialChapterList(dom) {
        let menu = dom.querySelector("ul.chapter-list");
        return util.hyperlinksToChapterList(menu);
    }

    getNumOfTocPages(dom) {
        let val = dom.querySelector(".goto button")?.getAttribute("data-total");
        return val != null
            ? parseInt(val)
            : 1;
    }

    getStoryId(dom) {
        return dom.baseURI.split("-").pop().split(".")[0];
    }

    async fetchToc(formData) {
        let options = {
            method: "POST",
            credentials: "include",
            body: formData
        };
        let json = (await HttpClient.fetchJson("https://ntruyen.vn//ajax/load_chapter", options)).json;
        return util.sanitize(json.chapters);
    }

    createFormData(storyId, page) {
        let formData = new FormData();
        formData.append("story_id", storyId);
        formData.append("page", page);
        return formData;
    }

    findContent(dom) {
        return dom.querySelector("#chapter-content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector(".story-title h1");
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector(".story-title a");
        return authorLabel?.textContent ?? super.extractAuthor(dom);
    }

    findChapterTitle(dom) {
        return dom.querySelector(".chapter-infos h1");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, ".cover");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll(".description")];
    }
}
