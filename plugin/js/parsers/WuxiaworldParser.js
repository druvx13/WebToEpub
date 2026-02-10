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

parserFactory.register("wuxiaworld.com", () => createWuxiaworldParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createWuxiaworldParserInstance() {
    return new WuxiaworldParser();
}

class WuxiaworldParser extends Parser {
    constructor() {
        super();
    }

    getChapterUrls(dom) {
        let chapters = [];
        let chaptersElement = dom.querySelector("div.content div.panel-group");
        if (chaptersElement != null) {
            chapters = util.hyperlinksToChapterList(chaptersElement, 
                WuxiaworldParser.isChapterHref, WuxiaworldParser.getChapterArc);
            WuxiaworldParser.removeArcsWhenOnlyOne(chapters);
        }
        if (0 == chapters.length) {
            chapters = [...dom.querySelectorAll("li.chapter-item a")]
                .map(link => util.hyperLinkToChapter(link));
        }
        return Promise.resolve(chapters);  
    }

    static isChapterHref(link) {
        let parent = link.parentNode;
        return (parent.tagName.toLowerCase() === "li")
            && (parent.className === "chapter-item");
    }

    static getChapterArc(link) {
        let isPanel = function(element) {
            return (element.tagName.toLowerCase() === "div")
                && (element.className === "panel panel-default");
        };
        
        let parent = link;
        do {
            parent = parent.parentNode;
            if (parent == null) {
                return null;
            }
        } while (!isPanel(parent));
        
        let arc = parent.querySelector("span.title a");
        return arc == null ? null : arc.textContent.trim();
    }

    static removeArcsWhenOnlyOne(chapters) {
        let arcCount = chapters.reduce((p, c) => p + (c.newArc != null), 0);
        if (arcCount < 2) {
            chapters.forEach(c => c.newArc = null);
        }
    }

    // find the node(s) holding the story content
    findContent(dom) {
        let candidates = [...dom.querySelectorAll("div.fr-view:not(.panel-body)")];
        let content = WuxiaworldParser.elementWithMostParagraphs(candidates);
        this.cleanContent(content);
        return content;
    }

    static elementWithMostParagraphs(elements) {
        if (elements.length === 0) {
            return null;
        }
        return elements.map(
            e => ({e: e, numParagraphs: [...e.querySelectorAll("p")].length})
        ).reduce(
            (a, c) => a.numParagraphs < c.numParagraphs ? c : a
        ).e;
    }

    cleanContent(content)
    {
        util.removeChildElementsMatchingSelector(content, "button, #spoiler_teaser");
        let toDelete = [...content.querySelectorAll("a")]
            .filter(a => a.textContent === "Teaser");
        util.removeElements(toDelete);
    }

    findChapterTitle(dom) {
        return dom.querySelector("div.caption h4");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.novel-index");
    }

    getInformationEpubItemChildNodes(dom) {
        let nodes = [...dom.querySelectorAll("div.media-novel-index div.media-body")];
        let summary = [...dom.querySelectorAll("div.fr-view")];
        nodes.push(summary[1]);
        return nodes;
    }
}
