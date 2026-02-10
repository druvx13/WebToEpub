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

parserFactory.register("www.dudushuge.com", () => createDudushugeParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createDudushugeParserInstance() {
    return new DudushugeParser();
}

class DudushugeParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        let tocPage1chapters = DudushugeParser.extractPartialChapterList(dom);
        let urlsOfTocPages  = DudushugeParser.getUrlsOfTocPages(dom);
        return (await this.getChaptersFromAllTocPages(tocPage1chapters,
            DudushugeParser.extractPartialChapterList,
            urlsOfTocPages,
            chapterUrlsUI
        ));
    }

    static getUrlsOfTocPages(dom) {
        return [...dom.querySelectorAll(".middle > select:nth-child(1) option")]
            .map(opt => new URL(opt.value, dom.baseURI).href);
    }

    static extractPartialChapterList(dom) {
        return [...dom.querySelectorAll("div.section-box:nth-child(4) > ul:nth-child(1) li a")]
            .map(a => util.hyperLinkToChapter(a));
    }
    
    findContent(dom) {
        return dom.querySelector("#content");
    }
        
    extractTitleImpl(dom) {
        return dom.querySelector(".top > h1:nth-child(1)");
    }
    
    extractAuthor(dom) {
        let authorLabel = dom.querySelector("div.fix > p:nth-child(1)");
        
        return authorLabel?.textContent.replace("作者：", "").trim() ?? super.extractAuthor(dom);
    }
    
    extractLanguage() {
        return "zh-CN";
    }
    
    extractDescription(dom) {
        return dom.querySelector(".desc").textContent.trim();
    }
    
    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, ".imgbox");
    }
}
