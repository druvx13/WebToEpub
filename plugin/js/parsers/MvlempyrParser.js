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

parserFactory.registerDeadSite("mvlempyr.com", () => createMvlempyrParserInstance());
parserFactory.register("mvlempyr.io", () => createMvlempyrParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createMvlempyrParserInstance() {
    return new MvlempyrParser();
}

class MvlempyrParser extends Parser {
    constructor() {
        super();
        this.minimumThrottle = 1000;
    }

    async getChapterUrls(dom) {
        let imgLink = dom.querySelector("div.novel-image-wrapper img").src;
        let slug = imgLink.split("/").pop().split(".")[0];
        let chapterCount = parseInt(dom.querySelector("div#chapter-count").textContent)?parseInt(dom.querySelector("div#chapter-count").textContent):-1;
        let chapterTitles = [...dom.querySelectorAll("a.chapter-item h3")].map((el) => el.textContent.replace(/^\d+\.\s*/, ""));

        if (chapterCount == -1) {
            let regex = new RegExp("numberOfChapters.*?,");
            let regex2 = new RegExp("[0-9]+");
            let script = [...dom.scripts].map(a => a.outerHTML);
            chapterCount = parseInt(script.filter(a => a.match(regex))?.[0].match(regex)?.[0].match(regex2)?.[0]);
        }
        let chapterList = [];

        for (let i = 1; i <= chapterCount; i++) {
            let link = `https://www.mvlempyr.io/chapter/${slug}-${i}`;
            if (chapterTitles[i-1] == undefined) {
                chapterList.push({
                    sourceUrl: link,
                    title: "[placeholder]",
                });
            }
            else {
                chapterList.push({
                    sourceUrl: link,
                    title: chapterTitles[i-1],
                });
            }
        }
        return chapterList;
    }


    findContent(dom) {
        return (
            dom.querySelector("div#chapter") || dom.querySelector("#chapter-content")
        );
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1.novel-title");
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector("div.mobileauthorname");
        return authorLabel?.textContent ?? super.extractAuthor(dom);
    }

    findChapterTitle(dom) {
        return dom.querySelector("#span-28-1305853").textContent;
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.novel-image-wrapper");
    }

    getInformationEpubItemChildNodes(dom) {
        let epubDescription = ([...dom.querySelectorAll("div.synopsis")]);
        return epubDescription.map(e => e.innerHTML.replace(/<br><br>/g, "\n\n").replace(/<br>/g, "\n"));
    }
  
    extractSubject(dom) {
        let tags = ([...dom.querySelectorAll("div.genere-tagslist a")]);
        let regex = new RegExp("^#");
        return tags.map(e => e.textContent.trim().replace(regex, "")).join(", ");
    }
}
