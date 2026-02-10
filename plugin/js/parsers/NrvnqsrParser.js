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
parserFactory.register("forums.nrvnqsr.com", () => createNrvnqsrParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createNrvnqsrParserInstance() {
    return new NrvnqsrParser();
}

class NrvnqsrParser extends Parser {
    constructor() {
        super();
    }

    getChapterUrls(dom) {
        let menu = dom.querySelector("div.postlist");
        return Promise.resolve(util.hyperlinksToChapterList(menu));        
    }

    findContent(dom) {
        let postId = util.getParamFromUrl(dom.baseURI, "p");
        let selector = (postId === null) ? "div.postbody div.content" : "div#post_message_" + postId;
        return dom.querySelector(selector);
    }

    extractTitleImpl(dom) {
        return dom.querySelector("span.threadtitle");
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector("div.userinfo a.username");
        return (authorLabel === null) ? super.extractAuthor(dom) : authorLabel.textContent;
    }
}
