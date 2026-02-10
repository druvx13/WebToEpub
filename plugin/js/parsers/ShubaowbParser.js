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

parserFactory.register("shubaowb.com", () => createShubaowbParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createShubaowbParserInstance() {
    return new ShubaowbParser();
}

class ShubaowbParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        let urlsOfTocPages  = this.getUrlsOfTocPages(dom);
        return (await this.getChaptersFromAllTocPages([],
            this.chaptersFromDom,
            urlsOfTocPages,
            chapterUrlsUI
        ));
    }

    chaptersFromDom(dom) {
        return [...dom.querySelectorAll(".book_last dd a")]
            .map(a => util.hyperLinkToChapter(a));
    }

    getUrlsOfTocPages(dom) {
        let optionToUrl = (o) => {
            let v = o.value;
            if (!v.startsWith("/novel")) {
                v = "/novel" + v;
            }
            return "https://shubaowb.com" + v; 
        };

        let listpage = dom.querySelector(".listpage");
        return [...listpage.querySelectorAll("option")]
            .map(optionToUrl);
    }    

    findContent(dom) {
        return dom.querySelector("#chaptercontent");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("span.title1");
    }

    findChapterTitle(dom) {
        return dom.querySelector("span.title1");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll(".book_about")];
    }
}
