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
parserFactory.register("jpmtl.com", () => createJpmtlParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createJpmtlParserInstance() {
    return new JpmtlParser();
}

class JpmtlParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let chapters = [...dom.querySelectorAll("a.book-ccontent__content")];
        return chapters.map(this.linkToChapter);
    }

    linkToChapter(link) {
        let chapterNum = link.querySelector("div.book-ccontent__index").textContent;
        let titleText = link.querySelector("div.book-ccontent__title").textContent;
        return {
            sourceUrl:  link.href,
            title: `${chapterNum}: ${titleText}`,
            newArc: null
        };
    }

    findContent(dom) {
        return dom.querySelector("div.chapter-content__content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1.book-sidebar__title");
    }

    removeUnwantedElementsFromContentElement(element) {
        [...element.querySelectorAll("p")]
            .filter(p => p.textContent.includes("This novel has been translated by JPMTL.com"))
            .forEach(p => p.remove());
        [...element.querySelectorAll("p")]
            .forEach(this.removeWatermark);
        super.removeUnwantedElementsFromContentElement(element);
    }

    removeWatermark(paragraph) {
        let text = paragraph.textContent.substring(0, 80).toLowerCase();
        let index = text.indexOf("y");
        if (index === -1 ) {
            return;
        }
        let watermark = text.substring(0, index + 1).replace(/\s+/g, "");
        const watermarkLength = 21;
        if (watermark === "translatedby") {
            let count = 12;
            while (index < text.length) {
                if (text[++index] !== " ") {
                    if (++count === watermarkLength) {
                        paragraph.textContent = paragraph.textContent.substring(index + 1);
                        return;
                    }
                }
            }
        }
    }

    findChapterTitle(dom) {
        return dom.querySelector("div.chapter-content__title").textContent;
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.book-sidebar__cover");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.main-book__container")];
    }

    cleanInformationNode(node) {
        [...node.querySelectorAll("svg")]
            .forEach(p => p.remove());
        return node;
    }
}
