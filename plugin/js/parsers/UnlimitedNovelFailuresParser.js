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
parserFactory.register("unlimitednovelfailures.mangamatters.com", 
    () => createUnlimitedNovelFailuresParserInstance()
);

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createUnlimitedNovelFailuresParserInstance() {
    return new UnlimitedNovelFailuresParser();
}

class UnlimitedNovelFailuresParser extends Parser {
    constructor(imageCollector) {
        super(imageCollector);
    }

    getChapterUrls(dom) {
        return Promise.resolve(util.hyperlinksToChapterList(dom));
    }

    extractTitleImpl(dom) {
        return dom.querySelector(".entry-title");
    }

    // find the node(s) holding the story content
    findContent(dom) {
        return WordpressBaseParser.findContentElement(dom);
    }

    findChapterTitle(dom) {
        return dom.querySelector(".entry-title");
    }

    webPageToEpubItems(webPage, epubItemIndex) {
        let content = this.convertRawDomToContent(webPage);
        let items = [];
        if (content != null) {
            items = this.splitContentIntoEpubItems(content, webPage.sourceUrl, epubItemIndex);
        }
        BakaTsukiParser.fixupInternalHyperLinks(items);
        return items;
    }

    splitContentIntoEpubItems(content, baseUri, epubItemIndex) {
        this.convertAnchorsToHeaders(content);
        let items = BakaTsukiParser.splitContentOnHeadingTags(content);
        return BakaTsukiParser.itemsToEpubItems(items, epubItemIndex, baseUri);
    }

    convertAnchorsToHeaders(content) {
        let document = content.ownerDocument;
        for (let link of content.querySelectorAll("a[id]")) {
            let h2 = document.createElement("h2");
            h2.id = link.id;
            h2.appendChild(document.createTextNode(link.textContent));
            let parent = link.parentElement;
            if (parent.tagName.toLowerCase() === "p") {
                parent.after(h2);
                link.remove();
            } else {
                link.replaceWith(h2);
            }
        }
    }
}
