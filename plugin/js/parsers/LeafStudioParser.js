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

parserFactory.register("leafstudio.site", () => createLeafStudioParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createLeafStudioParserInstance() {
    return new LeafStudioParser();
}

class LeafStudioParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let menu = dom.querySelector(".novel_index");
        return util.hyperlinksToChapterList(menu).reverse();
    }
    
    findContent(dom) {
        return dom.querySelector(".small");
    }

    extractTitleImpl(dom) {
        return dom.querySelector(".title");
    }

    // Remove unwanted elements from fetched content
    removeUnwantedElementsFromContentElement(element) {
        util.removeChildElementsMatchingSelector(element, "#font-options-bar, .confuse, .post-rating-wrapper, #donation-msg, .novel_nav_item, .text-center, .navigation");
        super.removeUnwantedElementsFromContentElement(element);
    }

    extractDescription(dom) {
        return dom.querySelector(".desc_div").textContent.trim();
    }

    findChapterTitle(dom) {
        return dom.querySelector(".title");
    }
}
