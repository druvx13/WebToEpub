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

//dead url/ parser
parserFactory.register("shinsori.com", () => createShinsoriParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createShinsoriParserInstance() {
    return new ShinsoriParser();
}

class ShinsoriParser extends Parser {
    constructor() {
        super();
    }

    getChapterUrls(dom, chapterUrlsUI) {
        return this.getChapterUrlsFromMultipleTocPages(dom,
            ShinsoriParser.extractPartialChapterList,
            ShinsoriParser.getUrlsOfTocPages,
            chapterUrlsUI
        );
    }

    static getUrlsOfTocPages(dom) {
        return [...dom.querySelectorAll("ul.lcp_paginator a:not(.lcp_nextlink)")]
            .map(link => link.href);
    }

    static extractPartialChapterList(dom) {
        let lists = [...dom.querySelectorAll("ul.lcp_catlist")];
        return (0 === lists.length) 
            ? [] 
            : util.hyperlinksToChapterList(lists[lists.length - 1]);
    }

    findContent(dom) {
        return dom.querySelector("div.entry-content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h2.section-title");
    }

    extractAuthor(dom) {
        let authorLabel = util.getElement(dom, "strong", e => e.textContent === "Author:");
        return (authorLabel === null) ? super.extractAuthor(dom) : authorLabel.nextSibling.textContent;
    }

    removeUnwantedElementsFromContentElement(content) {
        util.removeElements(content.querySelectorAll("div.stream-item-below-post-content, div.post-bottom-meta"));
        super.removeUnwantedElementsFromContentElement(content);
    }

    findChapterTitle(dom) {
        let title = dom.querySelector("div.entry-header");
        if (title != null) {
            let junk = title.querySelector("h5");
            if (junk !=  null) {
                junk.remove();
            }
            return title;
        }
        return dom.querySelector("h1");
    }

    findParentNodeOfChapterLinkToRemoveAt(link) {
        return util.moveIfParent(link, "p");    
    }
    
    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "li.post-item");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.block-custom-content, div.first-half-box")];
    }

    cleanInformationNode(node) {
        util.removeChildElementsMatchingSelector(node, "a");
    }
}
