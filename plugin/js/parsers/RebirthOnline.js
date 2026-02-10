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

parserFactory.register("www.rebirth.online", () => createRebirthOnlineParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createRebirthOnlineParserInstance() {
    return new RebirthOnlineParser();
}

class RebirthOnlineParser extends Parser {
    constructor() {
        super();
    }

    getChapterUrls(dom) {
        let menu = dom.querySelector("div.table_of_content");
        return Promise.resolve(util.hyperlinksToChapterList(menu));
    }

    findContent(dom) {
        return dom.querySelector(".entry-content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector(".entry-title a");
    }

    findChapterTitle(dom) {
        return dom.querySelector(".chapter-title");
    }

    customRawDomToContentStep(webPage, content) {
        const styles = Array.from(webPage.rawDom.querySelectorAll("head style")).filter(s => s.textContent.trim());
        const classes = [];
        styles.forEach(s => {
            const re = /(\.[a-zA-Z0-9]+)/g;
            const t = s.textContent;
            if (!~t.indexOf("-999")) return;
            let c;
            while ((c = re.exec(t)) != null) {
                classes.push(...c);
            }
        });
        classes.filter((v,i,a) => a.indexOf(v)===i).forEach(c => {
            content.querySelectorAll(c).forEach(n => n.remove());
        });
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll(".entry-title, div.entry-content p")];
    }
}
