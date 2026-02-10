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

parserFactory.register("ficbook.net", () => createFicbookParserInstance());
parserFactory.register("fic.fan", () => createFicbookParserInstance());
parserFactory.register("fanfictionero.com", () => createFicbookParserInstance());
parserFactory.register("ficador.com", () => createFicbookParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createFicbookParserInstance() {
    return new FicbookParser();
}

class FicbookParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        let links = [...dom.querySelectorAll("a.part-link")];
        if (links.length == 0) {
            return [{
                sourceUrl: dom.baseURI, 
                title: dom.querySelector("#part_content > div.title-area.text-center.word-break > h2").textContent
            }];
        }
        let chapters = [];
        for (let link of links) {
            chapters.push({
                sourceUrl: link.href,
                title: link.innerText
            });
            chapterUrlsUI.showTocProgress(chapters);
        }
        return chapters;
    }

    findCoverImageUrl(dom) {
        return dom.querySelector("meta[property='og:image']").getAttribute("content");
    }
    // find the node(s) holding the story content
    findContent(dom) {
        return dom.querySelector("#content");
    }
    customRawDomToContentStep(chapter, content) {
        let paragraphed_text = content.innerText.split("\n\n").map(x=>"<p>" + x + "</p>").join("");
        let sanitized_text = util.sanitize("<div id='content'>" + paragraphed_text + "</div>")
            .querySelector("#content");
        content.replaceChildren();
        util.moveChildElements(sanitized_text, content);
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1.heading");
    }

    extractAuthor(dom) {
        let author = dom.querySelector("a.creator-username")?.innerText;
        return author ?? super.extractAuthor(dom);
    }

    extractLanguage(dom) {
        return dom.querySelector("html").getAttribute("lang");
    }

    extractSubject(dom) {
        let tags = ([...dom.querySelectorAll("div.description strong, div.description a")]);
        return tags.map(e => e.textContent).join(", ");
    }

    extractDescription(dom) {
        return dom.querySelector("meta[name='description']")?.textContent;
    }
    extractSeriesInfo(dom, metaInfo) {  // eslint-disable-line no-unused-vars
        metaInfo.fileName = this.extractTitleImpl(dom).textContent;
    }

    findChapterTitle(dom) {
        return dom.querySelector("#part_content h2[itemprop='headline']");
    }
}
