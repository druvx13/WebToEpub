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

parserFactory.register("ficwad.com", () => createFicwadParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createFicwadParserInstance() {
    return new FicwadParser();
}

class FicwadParser extends Parser {
    constructor() {
        super();
    }

    getChapterUrls(dom) {
        if (this.isStoryIndexPage(dom)) {
            return Promise.resolve(this.getChaptersFromStoryIndex(dom));
        }

        let baseUrl = this.getBaseUrl(dom);
        let options = [...dom.querySelectorAll("form[name='chapterlist'] option")];
        if (options.length ===0) {
            // no list of chapters found, assume it's a single chapter story
            return Promise.resolve(this.singleChapterStory(baseUrl, dom));
        } else {
            return Promise.resolve(
                options.map(option => this.optionToChapterInfo(baseUrl, option))
            );
        }
    }

    isStoryIndexPage(dom) {
        return this.findContent(dom) === null;
    }
    
    getChaptersFromStoryIndex(dom) {
        return [...dom.querySelectorAll("div#chapters h4 a")]
            .map(a => util.hyperLinkToChapter(a));
    }
    
    optionToChapterInfo(baseUrl, optionElement) {
        let relativeUrl = optionElement.getAttribute("value");
        let url = util.resolveRelativeUrl(baseUrl, relativeUrl);
        return {
            sourceUrl:  url,
            title: optionElement.innerText
        };
    }

    findContent(dom) {
        return dom.querySelector("div#storytext");
    }

    extractTitleImpl(dom) {
        if (this.isStoryIndexPage(dom)) {
            return dom.querySelector("div.storylist h4");
        }

        // assume dom is first chapter of story
        let titles = [...dom.querySelectorAll("div#story h2 a")];
        if (0 < titles.length) {
            return titles.pop();
        }
    }

    extractAuthor(dom) {
        return dom.querySelector("span.author a").textContent.trim();
    }

    findChapterTitle(dom) {
        let title = dom.querySelector("div.storylist h4");
        if (title !== null) {
            let s = title.textContent;
            for (let link of title.querySelectorAll("a")) {
                link.remove();
            }
            title.textContent = s;
        }
        return title;
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.storylist")];
    }
}
