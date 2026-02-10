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

parserFactory.register("sousetsuka.com", () => createBlogspotParserInstance());

parserFactory.registerUrlRule(
    url => (util.extractHostName(url).indexOf(".blogspot.") != -1),
    () => createBlogspotParserInstance()
);

parserFactory.registerRule(
    // return probability (0.0 to 1.0) web page is a Blogspot page
    function(url, dom) {
        return (util.extractHostName(url).indexOf(".blogspot.") != -1) ||
            ((BlogspotParser.findContentElement(dom) != null) * 0.5);
    },
    () => createBlogspotParserInstance()
);

parserFactory.registerManualSelect(
    "Blogspot", 
    () => createBlogspotParserInstance()
);

class BlogspotParserImageCollector extends ImageCollector {
    constructor() {
        super();
    }

    extractWrappingUrl(element) {
        let url = super.extractWrappingUrl(element);
        return this.convertToUrlOfOriginalSizeImage(url);
    }

    convertToUrlOfOriginalSizeImage(originalUrl) {
        let url = new URL(originalUrl);
        if (!url.hostname.toLowerCase().includes("blogspot")) {
            return originalUrl;
        }
        let path = url.pathname.split("/");
        path[path.length - 2] = "s0";
        url.pathname = path.join("/");
        return url.href;
    }
}

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createBlogspotParserInstance() {
    return new BlogspotParser();
}

class BlogspotParser extends Parser {
    constructor() {
        super(new BlogspotParserImageCollector());
    }

    async getChapterUrls(dom) {
        let menu = this.findContent(dom);
        let chapters = util.hyperlinksToChapterList(menu);
        if (0 < chapters.length) {
            return chapters;
        }
        // try "Blog Archive" links
        chapters = [...dom.querySelectorAll("ul.posts a")]
            .map(link => util.hyperLinkToChapter(link));
        return chapters.reverse();
    }

    static findContentElement(dom) {
        return dom.querySelector("div.post-body") ||
            dom.querySelector("div.pagepost div.cover");
    }

    findContent(dom) {
        return BlogspotParser.findContentElement(dom) ||
            dom.querySelector("div.entry-content");
    }

    static findChapterTitleElement(dom) {
        return dom.querySelector("h3.post-title, h1.entry-title");
    }

    findChapterTitle(dom) {
        return BlogspotParser.findChapterTitleElement(dom);
    }

    findParentNodeOfChapterLinkToRemoveAt(link) {
        let toRemove = util.moveIfParent(link, "span");
        return util.moveIfParent(toRemove, "div");
    }

    findCoverImageUrl(dom) {
        let url = super.findCoverImageUrl(dom);
        return url != null
            ? this.imageCollector.convertToUrlOfOriginalSizeImage(url)
            : null;
    }
}
