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

parserFactory.register("flying-lines.com", () => createFlyingLinesParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createFlyingLinesParserInstance() {
    return new FlyingLinesParser();
}

class FlyingLinesParser extends Parser {
    constructor() {
        super();
    }

    getChapterUrls(dom) {
        let menu = dom.querySelector("div.chapter-container");
        return Promise.resolve(util.hyperlinksToChapterList(menu));
    }

    findContent(dom) {
        return Parser.findConstrutedContent(dom);
    }

    extractTitleImpl(dom) {
        return dom.querySelector("div.title h2");
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector("ul.profile li");
        if (authorLabel === null) {
            return super.extractAuthor(dom);
        }
        util.removeChildElementsMatchingSelector(authorLabel, "span");
        return authorLabel.textContent;
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.novel-thumb");
    }

    // this is basically identical to NovelSpread
    fetchChapter(url) {
        return HttpClient.wrapFetch(url).then(function(xhr) {
            let restUrl = FlyingLinesParser.extractRestUrl(xhr.responseXML);
            return HttpClient.fetchJson(restUrl);
        }).then(function(handler) {
            return FlyingLinesParser.buildChapter(handler.json.data);
        });
    }

    static extractRestUrl(dom) {
        let chapterId = dom.querySelector("div.main_body")
            .getAttribute("data-chapter-id");
        return `https://www.flying-lines.com/chapter/${chapterId}`;
    }

    static buildChapter(json) {
        let base = "https://www.flying-lines.com" + json.path;
        let newDoc = Parser.makeEmptyDocForContent(base);
        let title = newDoc.dom.createElement("h1");
        title.textContent = `${json.chapter_number}. ${json.chapter_title}`;
        newDoc.content.appendChild(title);
        let content = util.sanitize(json.chapter_content);
        for (let n of [...content.body.childNodes]) {
            if (n.className !== "siteCopyrightInfo") {
                newDoc.content.appendChild(n);
            }
        }
        return newDoc.dom;
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.novel-info, div.synopsis-detail")];
    }
}
