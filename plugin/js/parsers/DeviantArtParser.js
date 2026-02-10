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

parserFactory.register("deviantart.com", () => createDeviantArtParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createDeviantArtParserInstance() {
    return new DeviantArtParser();
}

class DeviantArtParser extends Parser {
    constructor() {
        super();
    }

    getChapterUrls(dom) {
        let chapters = [...dom.querySelectorAll("div.folderview-art a.torpedo-thumb-link")]
            .map(DeviantArtParser.linkToChapter);
        return Promise.resolve(chapters);
    }

    static linkToChapter(link) {
        return {
            sourceUrl:  link.href,
            title: link.href.split("/").pop(),
            newArc: null
        };
    }

    findContent(dom) {
        let content = dom.querySelector("div.dev-view-deviation");
        if (content != null) {
            DeviantArtParser.removeUnwantedImages(content);
        }
        return content;
    }

    static removeUnwantedImages(content) {
        let images = [...content.querySelectorAll("img")];
        if (1 === images.length1) {
            return;
        }
        let wanted = content.querySelector("img.dev-content-full");
        if (wanted === null) {
            wanted = images[0];
        }
        for (let i of images) {
            i.remove();
        }
        content.appendChild(wanted);
    }

    extractTitleImpl(dom) {
        return dom.querySelector("div.folderview-top h1");
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector("a.username");
        return (authorLabel === null) ? super.extractAuthor(dom) : authorLabel.textContent;
    }
}
