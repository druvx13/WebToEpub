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

parserFactory.register("erofus.com", () => createErofusParserInstance());

class ErofusParserImageCollector extends ImageCollector {
    constructor() {
        super();
    }

    selectImageUrlFromImagePage(dom) {
        let img = dom.querySelector("div#picture-full img");
        if (img != null)
        {
            return dom.querySelector("div#picture-full img").src;
        }
    }
}

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createErofusParserInstance() {
    return new ErofusParser();
}

class ErofusParser extends Parser {
    constructor() {
        super(new ErofusParserImageCollector());
    }

    async getChapterUrls(dom) {
        return [...dom.querySelectorAll("div a div.thumbnail")]
            .map(div => util.hyperLinkToChapter(div.parentElement))
            .filter(c => !util.isNullOrEmpty(c.title));
    }

    findContent(dom) {
        return dom.querySelector("div.content");
    }

    findCoverImageUrl() {
        return null;
    }
}
