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

parserFactory.register("shinningnoveltranslations.com", () => createShinningnoveltranslationsParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createShinningnoveltranslationsParserInstance() {
    return new ShinningnoveltranslationsParser();
}

class ShinningnoveltranslationsParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let all = [...dom.querySelectorAll(".entry-content p")];
        let chapters = [];
        let isfree = false;
        for (let i = 0; i < all.length; i++) {
            if (all[i].textContent == "Free") {
                isfree = true;
            }
            let ret = all[i].firstChild;
            if (ret?.href?.includes("shinningnoveltranslations.com")) {
                chapters.push({
                    sourceUrl: ret.href, 
                    title: ret.textContent,
                    isIncludeable: isfree
                });
            }
        }
        return chapters.reverse();
    }

    extractTitleImpl(dom) {
        return dom.querySelector(".wp-block-post-title")?.textContent ?? null;
    }

    findCoverImageUrl(dom) {
        return dom.querySelector(".wp-block-image > img")?.src ?? null;
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll(".entry-content")];
    }

    findContent(dom) {
        return dom.querySelector(".entry-content");
    }

    removeNextAndPreviousChapterHyperlinks(webPage, content) {
        util.removeElements(content.querySelectorAll(".wp-block-columns"));
        RoyalRoadParser.removeOlderChapterNavJunk(content);
    }
}
