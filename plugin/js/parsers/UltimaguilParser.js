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
parserFactory.register("ultimaguil.org", () => new UltimaguilParser(new VariableSizeImageCollector()));

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createUltimaguilParserInstance() {
    return new UltimaguilParser();
}

class UltimaguilParser extends Parser {
    constructor(imageCollector) {
        super(imageCollector);
    }

    getChapterUrls(dom) {
        return Promise.resolve(util.hyperlinksToChapterList(dom));
    }

    extractTitleImpl(dom) {   // eslint-disable-line no-unused-vars
        return "Twintails";
    }

    extractAuthor(dom) {   // eslint-disable-line no-unused-vars
        return "Mizusawa Yume";
    }

    // find the node(s) holding the story content
    findContent(dom) {
        let div = dom.querySelector("div#inside");
        return div;
    }

    populateUIImpl() {
        document.getElementById("highestResolutionImagesRow").hidden = false;
    }

    webPageToEpubItems(webPage, epubItemIndex) {
        let content = this.convertRawDomToContent(webPage);
        let items = [];
        if (content != null) {
            items = this.splitContentIntoEpubItems(content, webPage.sourceUrl, epubItemIndex);
        }
        return items;
    }

    splitContentIntoEpubItems(content, baseUri, epubItemIndex) {
        this.convertMidpartToHeaders(content);
        let items = BakaTsukiParser.splitContentOnHeadingTags(content);
        return BakaTsukiParser.itemsToEpubItems(items, epubItemIndex, baseUri);
    }

    convertMidpartToHeaders(content) {
        let doc = content.ownerDocument;
        for (let midpart of content.querySelectorAll("div.part.midpart.gear")) {
            let parent = midpart.parentElement;
            let h3 = doc.createElement("h2");
            let link = midpart.querySelector("a");
            h3.appendChild(doc.createTextNode(link.getAttribute("title")));
            parent.replaceWith(h3);
        }
    }

    customRawDomToContentStep(chapter, content) {
        this.flattenContent(content);
        this.removeLinkFromHeaders(content);
    }

    /**
     *  "flatten" content.  Chapter parts may be <div> sections after the read_content span
    */
    flattenContent(content) {
        let read_content = content.querySelector("span#read_content");
        if (read_content !== null) {
            let parent = read_content.parentElement;
            while (read_content.hasChildNodes()) {
                let node = read_content.childNodes[0];
                if (node.tagName.toLowerCase() === "div") {
                    let div = node;
                    while (div.hasChildNodes()) {
                        parent.insertBefore(div.childNodes[0], read_content);
                    }
                    div.remove();
                } else {
                    parent.insertBefore(node, read_content);
                }
            }
        }
    }

    removeLinkFromHeaders(content) {
        let document = content.ownerDocument;
        for (let link of content.querySelectorAll("h2 a")) {
            link.replaceWith(document.createTextNode(link.textContent));
        }
    }
}
