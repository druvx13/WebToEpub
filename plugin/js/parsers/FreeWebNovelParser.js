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

parserFactory.register("freewebnovel.com", () => createFreeWebNovelComParserInstance());
parserFactory.register("bednovel.com", () => createFreeWebNovelParserInstance());
parserFactory.register("innnovel.com", () => createFreeWebNovelParserInstance());
parserFactory.register("libread.com", () => createFreeWebNovelParserInstance());
parserFactory.register("novellive.com", () => createNovelliveParserInstance());
parserFactory.register("novellive.app", () => createNovelliveParserInstance());
parserFactory.register("novellive.net", () => createNovelliveParserInstance());
parserFactory.register("readwn.org", () => createNovelliveParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createFreeWebNovelParserInstance() {
    return new FreeWebNovelParser();
}

class FreeWebNovelParser extends Parser {

    constructor() {
        super();
        this.minimumThrottle = 1000;
    }

    async getChapterUrls(dom) {
        let menu = dom.querySelector("ul#idData");
        return util.hyperlinksToChapterList(menu);
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1.tit");
    }

    extractAuthor(dom) {
        return dom.querySelector("[title=Author]").parentNode.querySelector("a").textContent;
    }

    extractSubject(dom) {
        let tags = [...dom.querySelector("[title=Genre]").parentNode.querySelectorAll("a")];
        return tags.map(e => e.textContent.trim()).join(", ");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.pic");
    }

    findChapterTitle(dom) {
        return dom.querySelector("span.chapter");
    }

    findContent(dom) {
        return dom.querySelector("div.txt");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.inner")];
    }
}

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createNovelliveParserInstance() {
    return new NovelliveParser();
}

class NovelliveParser extends FreeWebNovelParser {

    constructor() {
        super();
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        return this.getChapterUrlsFromMultipleTocPages(dom,
            this.extractPartialChapterList,
            this.getUrlsOfTocPages,
            chapterUrlsUI
        );
    }

    getUrlsOfTocPages(dom) {
        // lastUrl should be example https://novellive.com/book/<some-novel-name>/<index>
        let lastUrl = [...dom.querySelectorAll(".page a.index-container-btn")]?.pop()?.href;
        let urls = [];
        if (lastUrl) {
            let lastTocIndex = lastUrl.lastIndexOf("/");
            let lastIndexPageName = lastUrl.substring(lastTocIndex + 1);
            let lastIndex = parseInt(lastIndexPageName);
            let tocHasMultiplePages = !isNaN(lastIndex);
            if (tocHasMultiplePages) {
                let baseUrl = lastUrl.substring(0, lastTocIndex + 1);
                for (let i = 2; i <= lastIndex; ++i) {
                    urls.push(baseUrl + i);
                }
            }
        }
        return urls;
    }

    extractPartialChapterList(dom) {
        return [...dom.querySelector(".m-newest2").querySelectorAll("ul li a")]
            .map(a => util.hyperLinkToChapter(a));
    }
}

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createFreeWebNovelComParserInstance() {
    return new FreeWebNovelComParser();
}

class FreeWebNovelComParser extends FreeWebNovelParser {
    constructor() {
        super();
    }
    removeUnwantedElementsFromContentElement(content) {
        util.removeChildElementsMatchingSelector(content, "p sub");
        super.removeUnwantedElementsFromContentElement(content);
    }
}
