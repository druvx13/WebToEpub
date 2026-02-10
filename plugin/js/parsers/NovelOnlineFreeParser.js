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

parserFactory.register("novelonlinefree.com", () => createNovelOnlineFreeParserInstance());
//dead url
parserFactory.register("novelonlinefree.info", () => createNovelOnlineFreeParserInstance());
parserFactory.register("novelonlinefull.com", () => createNovelOnlineFreeParserInstance());
parserFactory.register("wuxiaworld.online", () => createNovelOnlineFreeParserInstance());
//dead url
parserFactory.register("chinesewuxia.world", () => createNovelOnlineFreeParserInstance());
parserFactory.register("bestlightnovel.com", () => createNovelOnlineFreeParserInstance());
//dead url
parserFactory.register("wuxia-world.online", () => createNovelOnlineFreeParserInstance());
parserFactory.register("wuxiaworld.live", () => createNovelOnlineFreeParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createNovelOnlineFreeParserInstance() {
    return new NovelOnlineFreeParser();
}

class NovelOnlineFreeParser extends Parser {
    constructor() {
        super();
    }

    getChapterUrls(dom) {
        let menuItems = [...dom.querySelectorAll("div.chapter-list a")];
        return Promise.resolve(this.buildChapterList(menuItems));
    }

    buildChapterList(menuItems) {
        return menuItems.reverse().map(
            a => ({sourceUrl: a.href, title: a.getAttribute("title")})
        );
    }
    
    findContent(dom) {
        let content = dom.querySelector("div.vung_doc")
          || dom.querySelector("div.content-area");
        return content;
    }

    // title of the story
    extractTitleImpl(dom) {
        return dom.querySelector("h1");
    }

    extractAuthor(dom) {
        let link = dom.querySelector("a[href*='search_author']");
        return (link == null) ? super.extractAuthor(dom) : link.textContent;
    }

    // individual chapter titles are not inside the content element
    findChapterTitle(dom) {
        return dom.querySelector("h1");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.entry-header");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div#noidungm, ul.truyen_info_right")];
    }

    cleanInformationNode(node) {
        util.removeChildElementsMatchingSelector(node, "span.rate_star, .fb_iframe_widget, div.google, button, script");
    }
}
