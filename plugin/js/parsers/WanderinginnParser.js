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

parserFactory.register("wanderinginn.com", () => createWanderinginnParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createWanderinginnParserInstance() {
    return new WanderinginnParser();
}

class WanderinginnParser extends WordpressBaseParser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        return [...dom.querySelectorAll("#table-of-contents a:not(.book-title-num, .volume-book-card)")]
            .map(a => util.hyperLinkToChapter(a));
    }

    findContent(dom) {
        return dom.querySelector("div#reader-content");
    }

    findChapterTitle(dom) {
        const titles = dom.querySelectorAll("h2.elementor-heading-title");
        for (const title of titles) {
            // default fetch of the page has a copy of title "loading..." preceding the real one, for some reason
            if (title.textContent.trim() !== "loading...") {
                return title;
            }
        }
        return null;
    }
    
    extractTitleImpl() {
        return "The Wandering Inn";
    }
    
    extractAuthor() {
        return "pirateaba";
    }
    
    removeNextAndPreviousChapterHyperlinks(webPage, content) {
        util.removeElements(content.querySelectorAll("a[href*='https://wanderinginn.com/']"));
    }

    preprocessRawDom(webPageDom) {
        const content = this.findContent(webPageDom);
        if (content) {
            // Add italics to all .mrsha-write elements
            // "mrsha-write" used to be italics, but is now is a custom font in the
            // web reader which doesn't get copied over to the epub. This fixes that.
            for (const element of content.querySelectorAll(".mrsha-write")) {
                element.setAttribute("style", "font-style: italic;");
            }

            // Add iBooks dark theme class to spans with color styles
            // This allows apple iBooks to display colors in dark mode, for specific elements.
            // The Wandering Inn colors were already meant to be displayed in dark mode, so this works great!
            for (const span of content.querySelectorAll("span[style*='color:']")) {
                span.classList.add("ibooks-dark-theme-use-custom-text-color");
            }
        }
    }
}
