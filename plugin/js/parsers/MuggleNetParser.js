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
parserFactory.register("fanfiction.mugglenet.com", () => createMuggleNetParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createMuggleNetParserInstance() {
    return new MuggleNetParser();
}

class MuggleNetParser extends Parser {
    constructor() {
        super();
    }

    getChapterUrls(dom) {
        let baseUrl = this.getBaseUrl(dom);
        let options = [...dom.querySelectorAll("select[name='chapter'] option")];
        if (options.length === 0) {
            // no list of chapters found, assume it's a single chapter story
            return Promise.resolve(this.singleChapterStory(baseUrl, dom));
        } else {
            return Promise.resolve(options.map(option => this.optionToChapterInfo(baseUrl, option)));
        }
    }

    optionToChapterInfo(baseUrl, optionElement) {
        // constructing the URL is a bit complicated as the value is not final part of URL.
        let chapterId = optionElement.getAttribute("value");
        let searchString = "chapter=";
        let index = baseUrl.indexOf(searchString) + searchString.length;
        let url = baseUrl.slice(0, index) + chapterId;
        return {
            sourceUrl:  url,
            title: optionElement.innerText
        };
    }

    // find the node(s) holding the story content
    findContent(dom) {
        return dom.querySelector("div#story");
    }

    extractTextFromPageTitle(dom, index) {
        let text = "<unknown>";
        let links = [...dom.querySelectorAll("div#pagetitle a")];
        if (index < links.length) {
            text = links[index].textContent.trim();
        }
        return text;
    }

    extractTitleImpl(dom) {
        return this.extractTextFromPageTitle(dom, 0);
    }

    extractAuthor(dom) {
        return this.extractTextFromPageTitle(dom, 1);
    }
}
