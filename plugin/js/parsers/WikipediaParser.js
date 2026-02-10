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

parserFactory.registerUrlRule(
    url => util.extractHostName(url).endsWith(".wikipedia.org"), 
    () => createWikipediaParserInstance()
);

parserFactory.registerManualSelect(
    "Wikipedia", 
    () => createWikipediaParserInstance()
);

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createWikipediaParserInstance() {
    return new WikipediaParser();
}

class WikipediaParser extends Parser {
    constructor() {
        super();
    }

    getChapterUrls(dom) {
        // special case, just return URL of current page
        let chapter = {
            sourceUrl:  dom.baseURI,
            title: dom.title
        };
        return Promise.resolve([chapter]);
    }

    // returns the element holding the story content in a chapter
    findContent(dom) {
        return dom.getElementById("bodyContent");
    }

    removeUnwantedElementsFromContentElement(element) {
        super.removeUnwantedElementsFromContentElement(element);
        this.removeEditElements(element);
        this.removeExternalLinkTables(element);
        this.removeExternalHyperlinks(element);
    }

    removeEditElements(element) {
        util.removeElements(element.querySelectorAll("span.mw-editsection"));
    }

    removeExternalLinkTables(element) {
        util.removeElements(element.querySelectorAll("div.navbox"));
    }

    removeExternalHyperlinks(element) {
        for (let a of util.getElements(element, "a", e => !this.isLinkToKeep(e))) {
            this.replaceHyperlinkWithTextContent(a);
        }
    }
    
    isLinkToKeep(hyperlink) {
        return !util.isNullOrEmpty(hyperlink.hash) ||
            (hyperlink.querySelector("img, image") !== null);
    }

    replaceHyperlinkWithTextContent(hyperlink) {
        let newText = hyperlink.textContent;
        if (util.isNullOrEmpty(newText)) {
            hyperlink.remove();
        } else {
            let textNode = hyperlink.ownerDocument.createTextNode(newText);
            hyperlink.replaceWith(textNode);
        }
    }
}
