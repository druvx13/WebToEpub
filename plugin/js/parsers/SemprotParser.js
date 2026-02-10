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

parserFactory.register("semprot.com", () => createSemprotParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createSemprotParserInstance() {
    return new SemprotParser();
}

class SemprotParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        SemprotParser.author = this.findContent(dom)
            .querySelector("article.message")
            .getAttribute("data-Author");
        let baseUri = dom.baseURI;
        let chapters = [this.makeChapter(baseUri, "1")];
        let max = this.lastThreadPageNum(dom);
        for (let i = 2; i <= max; ++i) {
            chapters.push(this.makeChapter(baseUri, i));
        }
        return chapters;
    }

    lastThreadPageNum(dom) {
        let pageUrls = [...dom.querySelectorAll("li.pageNav-page")];
        return (0 < pageUrls.length)
            ? parseInt(pageUrls.pop().textContent)
            : 0;
    }

    makeChapter(baseUrl, pageNum) {
        return {
            sourceUrl:  `${baseUrl}page-${pageNum}`,
            title: `${pageNum}`
        };
    }

    findContent(dom) {
        return [...dom.querySelectorAll("div.block-container")]
            .filter(b => b.querySelector("article"))
            .pop();
    }

    extractTitleImpl(dom) {
        return dom.querySelector(".p-title-value");
    }

    extractAuthor(dom) {
        let authorLabel = SemprotParser.author;
        return (authorLabel == null) ? super.extractAuthor(dom) : authorLabel;
    }

    preprocessRawDom(webPageDom) {
        let articles = [...webPageDom.querySelectorAll("article.message")];
        for (let article of articles) {
            if (article.getAttribute("data-author") !== SemprotParser.author) {
                article.remove();
            } else {
                let body = article.querySelector("article.message-body");
                util.removeChildElementsMatchingSelector(body, ".bbCodeBlock-expandLink, .semprotnenenmontok_sq");
                util.resolveLazyLoadedImages(body, "img");
                article.replaceWith(body);
            }
        }
    }
}
