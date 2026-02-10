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

parserFactory.register("readlightnovel.me", () => createReadLightNovelParserInstance());
parserFactory.register("readlightnovel.meme", () => createReadLightNovelParserInstance());
//dead url
parserFactory.register("readlightnovel.org", () => createReadLightNovelParserInstance());
//dead url
parserFactory.register("readlightnovel.today", () => createReadLightNovelParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createReadLightNovelParserInstance() {
    return new ReadLightNovelParser();
}

class ReadLightNovelParser extends Parser {
    constructor() {
        super();
    }

    getChapterUrls(dom) {
        let chaptersDiv = dom.querySelector("div.chapters");
        let chapters = util.hyperlinksToChapterList(chaptersDiv, this.isChapterHref, this.getChapterArc);
        if (0 < chapters.length) {
            return Promise.resolve(chapters);
        }
        else {
            return Promise.reject(new Error(UIText.Error.noChaptersFound));
        }
    }

    isChapterHref(link) {
        return link.hash === "";
    }

    getChapterArc(link) {
        let parent = link.parentNode;
        let panelDiv = null;
        let arc = null;
        // find outermost <div> of panel
        while ((panelDiv === null) && (parent !== null)) {
            if ((parent.tagName.toLowerCase() === "div") && (parent.className === "panel panel-default")) {
                panelDiv = parent;
            } else {
                parent = parent.parentNode;
            }
        }

        // get the title
        if (panelDiv !== null) {
            let titleDiv = panelDiv.querySelector("div.panel-heading");
            if (titleDiv !== null) {
                arc = titleDiv.innerText.trim();
            }
        }
        return arc;
    }

    extractTitleImpl(dom) {
        return dom.querySelector("div.block-title");
    }

    extractAuthor(dom) {
        let div = util.getElement(dom, "div", d => (d.className === "novel-detail-item") &&
            (this.novelDetailHeaderName(d) === "Author(s)"));
        if (div !== null) {
            let li = div.querySelector("li");
            if (li != null) {
                return li.innerText;
            }
        }
        return super.extractAuthor(dom);
    }

    novelDetailHeaderName(div) {
        let header = div.querySelector("div.novel-detail-item-header");
        if (header !== null) {
            return header.innerText.trim();
        }
        return "";
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.novel-cover");
    }

    // find the node(s) holding the story content
    findContent(dom) {
        return dom.querySelector("div[class^='chapter-content']");
    }

    findChapterTitle(dom) {
        return dom.querySelector("h1");
    }

    removeUnwantedElementsFromContentElement(element) {
        let firstBr = element.querySelector("br:first-of-type");
        let ch = firstBr.nextSibling;
        if (ch && ch.data.includes("Chapter")) {
            let secondBr = ch.nextSibling;
            if (secondBr && secondBr.tagName == "BR") {
                util.removeElements([firstBr, ch, secondBr]);
            }
        }

        for (let a of element.querySelectorAll(".adsbyvli")) {
            let toDelete = [];
            let center = a.parentNode;
            let temp =  this.addPreviousSiblingIfMatches(center, "BR", toDelete);
            this.addPreviousSiblingIfMatches(temp, "BR", toDelete);
            temp = this.addNextSiblingIfMatches(center, "BR", toDelete);
            temp = this.addNextSiblingIfMatches(temp, "BR", toDelete);
            this.addNextSiblingIfMatches(temp, "HR", toDelete);

            if (center.tagName == "CENTER") {
                center.remove();
            }
            util.removeElements(toDelete);
        }

        for (let small of element.querySelectorAll(".ads-title")) {
            let toDelete = [];
            this.addPreviousSiblingIfMatches(small, "BR", toDelete);
            let temp = this.addNextSiblingIfMatches(small, "BR", toDelete);
            temp = this.addNextSiblingIfMatches(temp, "CENTER", toDelete);
            this.addNextSiblingIfMatches(temp, "HR", toDelete);

            small.remove();
            util.removeElements(toDelete);
        }

        for (let s of element.querySelectorAll("center > script")) {
            let toDelete = [];
            let center = s.parentNode;
            this.addNextSiblingIfMatches(center, "HR", toDelete);

            center.remove();
            util.removeElements(toDelete);
        }

        super.removeUnwantedElementsFromContentElement(element);
        util.removeChildElementsMatchingSelector(element, "div.row, " +
            ".alert, img[src*='/magnify-clip.png'], div.hidden, p.hid");
        this.removeShareThisLinks(element);
    }

    addPreviousSiblingIfMatches(element, tagName, list) {
        return this.addSiblingIfMatches(element, tagName, list, e => e.previousElementSibling);
    }

    addNextSiblingIfMatches(element, tagName, list) {
        return this.addSiblingIfMatches(element, tagName, list, e => e.nextElementSibling);
    }

    addSiblingIfMatches(element, tagName, list, op) {
        if (element === null) {
            return null;
        }
        let sibling = op(element);

        if (!sibling && (element.parentNode !== null)) {
            sibling = op(element.parentNode);
        }

        if (sibling !== null) {
            if (sibling.tagName === tagName) {
                list.push(sibling);
            } else {
                sibling = null;
            }
        }
        return sibling;
    }

    removeShareThisLinks(element) {
        let shareLinks = element.querySelectorAll("span.st_facebook, " +
            "span.st_twitter, span.st_googleplus");
        for (let share of shareLinks) {
            let parent = share.parentNode;
            if (parent.tagName.toLowerCase() === "p") {
                parent.remove();
            }
            share.remove();
        }
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.novel-details")];
    }
}
