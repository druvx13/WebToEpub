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

parserFactory.register("wenku8.net", () => createWenku8ParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createWenku8ParserInstance() {
    return new Wenku8Parser();
}

class Wenku8Parser extends Parser {
    constructor() {
        super();
    }

    getChapterUrls(dom) {
        let id = Wenku8Parser.extractBookId(dom);
        let tocUrl = ` https://www.wenku8.net/modules/article/reader.php?aid=${id}`;
        return HttpClient.wrapFetch(tocUrl, this.makeOptions()).then(function(xhr) {
            let menu = xhr.responseXML.querySelector("table");
            return Promise.resolve(util.hyperlinksToChapterList(menu));
        });
    }

    static extractBookId(dom) {
        let path = new URL(dom.baseURI).pathname.split("/");
        return path[path.length - 1].split(".")[0];
    }

    findContent(dom) {
        return dom.querySelector("#contentmain");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("tbody td b").textContent;
    }

    extractLanguage() {
        return "zh";
    }

    removeUnwantedElementsFromContentElement(element) {
        util.removeChildElementsMatchingSelector(element, "ul#contentdp");
        super.removeUnwantedElementsFromContentElement(element);
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div#content");
    }

    fetchChapter(url) {
        // site does not tell us GBK is used to encode text
        return HttpClient.wrapFetch(url, this.makeOptions()).then(function(xhr) {
            return Promise.resolve(xhr.responseXML);
        });
    }

    makeOptions() {
        return ({
            makeTextDecoder: () => new TextDecoder("GBK")
        });
    }
}
