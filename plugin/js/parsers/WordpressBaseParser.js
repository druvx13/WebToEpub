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

parserFactory.register("bakapervert.wordpress.com", () => createWordpressBaseParserInstance());
parserFactory.register("crimsonmagic.me", () => createWordpressBaseParserInstance());
parserFactory.register("shalvationtranslations.wordpress.com", () => createWordpressBaseParserInstance());
parserFactory.register("frostfire10.wordpress.com", () => createWordpressBaseParserInstance());
parserFactory.register("isekaicyborg.wordpress.com", () => createWordpressBaseParserInstance());
parserFactory.register("moonbunnycafe.com", () => createWordpressBaseParserInstance());
//dead url
parserFactory.register("rainingtl.org", () => createWordpressBaseParserInstance());
//dead url
parserFactory.register("raisingthedead.ninja", () => createWordpressBaseParserInstance());
//dead url
parserFactory.register("skythewoodtl.com", () => createWordpressBaseParserInstance());
//dead url
parserFactory.register("yoraikun.wordpress.com", () => createWordpressBaseParserInstance());
parserFactory.register("wanderertl130.id", () => createWanderertl130ParserInstance());
parserFactory.register("sasakitomyiano.wordpress.com", () => createWordpressBaseParserInstance());

parserFactory.registerRule(
    // return probability (0.0 to 1.0) web page is a Wordpress page
    function(url, dom) {
        return ((WordpressBaseParser.findContentElement(dom) != null) &&
            (WordpressBaseParser.findChapterTitleElement(dom) != null)) * 0.5;
    },
    () => createWordpressBaseParserInstance()
);

parserFactory.registerManualSelect(
    "Wordpress",
    () => createWordpressBaseParserInstance()
);

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createWordpressBaseParserInstance() {
    return new WordpressBaseParser();
}

class WordpressBaseParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let content = this.findContent(dom).cloneNode(true);
        this.removeUnwantedElementsFromContentElement(content);
        return util.hyperlinksToChapterList(content);
    }

    static findContentElement(dom) {
        return dom.querySelector("div.entry-content") ||
            dom.querySelector("div.post-content") ||
            dom.querySelector("ul.wp-block-post-template") ||
            dom.querySelector(".wp-block-cover__inner-container");
    }

    // find the node(s) holding the story content
    findContent(dom) {
        return WordpressBaseParser.findContentElement(dom);
    }

    findParentNodeOfChapterLinkToRemoveAt(link) {
        // "next" and "previous" chapter links may be inside <strong> then <p> tag
        let toRemove = util.moveIfParent(link, "strong");
        return util.moveIfParent(toRemove, "p");
    }

    static findChapterTitleElement(dom) {
        return dom.querySelector(".entry-title") ||
            dom.querySelector(".page-title") ||
            dom.querySelector("header.post-title h1") ||
            dom.querySelector(".post-title") ||
            dom.querySelector("#chapter-heading") ||
            dom.querySelector(".wp-block-post-title");
    }

    findChapterTitle(dom) {
        return WordpressBaseParser.findChapterTitleElement(dom);
    }
}

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createWanderertl130ParserInstance() {
    return new Wanderertl130Parser();
}

class Wanderertl130Parser extends  WordpressBaseParser {
    constructor() {
        super();
    }

    preprocessRawDom(webPageDom) {
        let content = this.findContent(webPageDom);
        let footnotes = [...webPageDom.querySelectorAll("span.modern-footnotes-footnote__note")];
        this.moveFootnotes(webPageDom, content, footnotes);
    }
}
