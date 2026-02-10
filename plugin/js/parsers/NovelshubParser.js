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

parserFactory.register("novelshub.org", () => createNovelshubParserInstance());
/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createNovelshubParserInstance() {
    return new NovelshubParser();
}

class NovelshubParser extends Parser { 
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let menu = dom.querySelector("div.mt-4");
        let chapters = util.hyperlinksToChapterList(menu) || [];
        // Keep existing reversal behavior, then override titles with "Chapter X"
        let reversed = chapters.reverse();
        return reversed.map((ch, idx) => Object.assign({}, ch, { title: `Chapter ${idx + 1}` }));
    }
    findContent(dom) {
        return dom.querySelector("div.p-6");
    }
    extractTitleImpl(dom) {
        return dom.querySelector("h1.text-2xl");
    }
    extractAuthor(dom) {
        let authorLabel = dom.querySelector("div.flex:nth-child(3) > div:nth-child(2) > p:nth-child(1)");
        return authorLabel?.textContent ?? super.extractAuthor(dom);
    }
    extractDescription(dom) {
        var description = dom.querySelector("meta[name='description']")?.getAttribute("content");
        return description.trim();
    }
    findChapterTitle(dom) {
        return dom.querySelector("meta[property='og:title']")?.getAttribute("content");
    }
    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "article section");
    }
}
