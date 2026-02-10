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

parserFactory.register("chaleuria.com", () => createChaleuriaParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createChaleuriaParserInstance() {
    return new ChaleuriaParser();
}

class ChaleuriaParser extends WordpressBaseParser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let rows = dom.querySelectorAll("table.toctable tr.tocrow");
        if (rows.length>0) {
            return [...rows].map(row => this.rowToChapter(row));
        }
        else {
            let menu = dom.querySelector(".entry-content");
            return util.hyperlinksToChapterList(menu);
        }
    }
    
    rowToChapter(row) {
        let title = row.querySelector("td.toctitle").textContent;
        let link = row.querySelector("button").getAttribute("formaction");
        return {
            sourceUrl:  link,
            title: title
        };        
    }

    findContent(dom) {
        return dom.querySelector(".entry-content, div.elementor-widget-theme-post-content div.elementor-widget-container");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1.entry-title, h1.elementor-heading-title");
    }

    findChapterTitle(dom) {
        return dom.querySelector("h1.entry-title, h1.elementor-heading-title");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll(".entry-content p, div.elementor-widget-theme-post-content div.elementor-widget-container p")];
    }

    cleanInformationNode(node) {
        util.removeChildElementsMatchingSelector(node, "img");
    }
}
