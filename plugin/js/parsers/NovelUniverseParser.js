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
parserFactory.register("noveluniverse.com", () => createNovelUniverseParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createNovelUniverseParserInstance() {
    return new NovelUniverseParser();
}

class NovelUniverseParser extends Parser {
    constructor() {
        super();
    }

    getChapterUrls(dom) {
        return NovelUniverseParser.fetchRestOfToc(dom, []);
    }

    static fetchRestOfToc(dom, chapterList) {
        let nextPage = NovelUniverseParser.urlOfNextToC(dom);
        let newChapters = NovelUniverseParser.extractPartialChapterList(dom);
        chapterList = chapterList.concat(newChapters);
        if (nextPage.length == 0) {
            return Promise.resolve(chapterList);
        }
        return HttpClient.wrapFetch(nextPage[0].href).then(function(xhr) {
            return NovelUniverseParser.fetchRestOfToc(xhr.responseXML, chapterList);
        });
    }
    
    static urlOfNextToC(dom) {
        return [...dom.querySelectorAll("div.allPagesStyle a")]
            .filter(link => link.textContent === "Next");
    }
    
    static extractPartialChapterList(dom) {
        let list = dom.querySelector("ul#chapters");
        return util.hyperlinksToChapterList(list);
    }

    findContent(dom) {
        return dom.querySelector("div.top_loc");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("div.info h1");
    }

    removeUnwantedElementsFromContentElement(element) {
        let review = element.querySelector("div.star-review");
        if (review != null) {
            review.parentElement.remove();
        }
        super.removeUnwantedElementsFromContentElement(element);
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.img");
    }
}
