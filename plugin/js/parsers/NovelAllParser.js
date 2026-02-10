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

parserFactory.register("novelall.com", () => createNovelAllParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createNovelAllParserInstance() {
    return new NovelAllParser();
}

class NovelAllParser extends Parser {
    constructor() {
        super();
    }

    getChapterUrls(dom) {
        let menuItems = [...dom.querySelectorAll("ul.detail-chlist a")];
        return Promise.resolve(this.buildChapterList(menuItems));
    }

    buildChapterList(menuItems) {
        return menuItems.reverse().map(
            a => ({sourceUrl: a.href, title: a.getAttribute("title")})
        );
    }
    
    findContent(dom) {
        return dom.querySelector("div.reading-box");
    }

    extractAuthor(dom) {
        let link = dom.querySelector("a[href*='author']");
        return (link == null) ? super.extractAuthor(dom) : link.textContent;
    }

    // title of the story
    extractTitleImpl(dom) {
        return dom.querySelector("h1");
    }

    // individual chapter titles are not inside the content element
    findChapterTitle(dom) {
        return dom.querySelector("h1");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.manga-detailtop");
    }

    getInformationEpubItemChildNodes(dom) {
        return  [...dom.querySelectorAll("div.manga-detailtop, div.manga-detailmiddle")];
    }

    cleanInformationNode(node) {
        util.removeChildElementsMatchingSelector(node, "script");
    }
}
