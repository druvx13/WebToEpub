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

parserFactory.register("www.8muses.com", () => createEightMusesParserInstance());
parserFactory.register("comics.8muses.com", () => createEightMusesParserInstance());

class EightMusesParserImageCollector extends ImageCollector {
    constructor() {
        super();
    }

    initialUrlToTry(imageInfo) {
        return imageInfo.sourceUrl.replace(/\/th\//, "/fl/");
    }
}

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createEightMusesParserInstance() {
    return new EightMusesParser();
}

class EightMusesParser extends Parser {
    constructor() {
        super(new EightMusesParserImageCollector());
    }

    async getChapterUrls(dom) {
        return [...dom.querySelectorAll("div.gallery a")]
            .map(link => util.hyperLinkToChapter(link))
            .filter(c => !util.isNullOrEmpty(c.title));
    }

    findContent(dom) {
        let content = dom.querySelector("div#content");
        // this.removeOldPages(content);
        for (let i of content.querySelectorAll("img")) {
            if (i.src === "") {
                i.src = i.getAttribute("data-src");
            }
        }
        return content;
    }

    removeOldPages(content) {
        for (let a of [...content.querySelectorAll("a")]) {
            let path = a.href.split("/");
            let file = parseInt(path[path.length - 1]);
            if (file < 63) {
                a.remove();
            }
        }
    }

    findCoverImageUrl() {
        return null;
    }
}
