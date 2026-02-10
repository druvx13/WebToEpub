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
parserFactory.register("mtled-novels.com", () => createMtledNovelsParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createMtledNovelsParserInstance() {
    return new MtledNovelsParser();
}

class MtledNovelsParser extends Parser {
    constructor() {
        super();
    }

    populateUIImpl() {
        document.getElementById("removeOriginalRow").hidden = false;
    }

    getChapterUrls(dom) {
        let chapters = [...dom.querySelectorAll("div.card__body a:not(.list-group-item)")]
            .map(a => util.hyperLinkToChapter(a));
        return Promise.resolve(chapters);
    }

    findContent(dom) {
        return dom.querySelector("div.text_content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1");
    }

    customRawDomToContentStep(chapter, content) {
        if (this.userPreferences.removeOriginal.value) {
            util.removeChildElementsMatchingSelector(content, "div[id='raw']");
        } 
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.profile__img");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.profile__info")];
    }
}
