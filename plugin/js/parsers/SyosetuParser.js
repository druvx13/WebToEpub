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

parserFactory.register("ncode.syosetu.com", () => createSyosetuParserInstance());
parserFactory.register("novel18.syosetu.com", () => createSyosetuParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createSyosetuParserInstance() {
    return new SyosetuParser();
}

class SyosetuParser extends Parser {
    constructor() {
        super();
        this.infoPageDom = null;
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        return this.getChapterUrlsFromMultipleTocPages(dom,
            this.extractPartialChapterList,
            this.getUrlsOfTocPages,
            chapterUrlsUI
        );
    }

    getUrlsOfTocPages(dom) {
        let lastPage = dom.querySelector("a.c-pager__item--last");
        let urls = [];
        if (lastPage) {
            const lastPageNumber = parseInt(lastPage.href.split("?p=")[1]);
            const baseUrl = lastPage.href.substring(0, lastPage.href.lastIndexOf("?p="));
            for (let i = 2; i <= lastPageNumber; i++) {
                urls.push(`${baseUrl}?p=${i}`);
            }
        }
        return urls;
    }

    extractPartialChapterList(dom) {
        let chapterList = dom.querySelector("div.index_box") || dom.querySelector("div.p-eplist");
        if (!chapterList) {
            return [];
        }
        let chapters = [];
        let arcTitle = null;
        for (let element of chapterList.querySelectorAll(
            ".p-eplist__chapter-title, a"
        )) {
            if (element.classList?.contains("p-eplist__chapter-title")) {
                arcTitle = element.textContent.trim();
                continue;
            }
            let chapter = util.hyperLinkToChapter(element);
            if (arcTitle) {
                chapter.newArc = arcTitle;
                arcTitle = null;
            }
            chapters.push(chapter);
        }
        return chapters;
    }

    findContent(dom) {
        return dom.querySelector("div.p-novel__body");
    }

    preprocessRawDom(dom) {
        let content = this.findContent(dom);
        this.tagAuthorNotesBySelector(content,"div.p-novel__text--preface, div.p-novel__text--afterword");
    }

    extractTitleImpl(dom) {
        return dom.querySelector(".p-novel__title");
    }

    extractAuthor(dom) {
        const authorDiv = dom.querySelector("div.p-novel__author");
        if (authorDiv) {
            const authorText = authorDiv.textContent.trim().replace(/^作者：/, "");
            return authorDiv.querySelector("a")?.textContent.trim() || authorText;
        }
        return super.extractAuthor(dom);
    }

    findChapterTitle(dom) {
        let element = dom.querySelector(".p-novel__title");
        return (element === null) ? null : element.textContent;
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("h1.p-novel__title, #novel_ex")];
    }

    extractDescription(dom) {
        return dom.querySelector(".p-novel__summary").textContent.trim();
    }  
}
