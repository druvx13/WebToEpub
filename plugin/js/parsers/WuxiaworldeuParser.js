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

parserFactory.register("wuxiaworld.eu", () => createWuxiaworldeuParserInstance());
parserFactory.register("wuxia.click", () => createWuxiaworldeuParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createWuxiaworldeuParserInstance() {
    return new WuxiaworldeuParser();
}

class WuxiaworldeuParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let host = new URL(dom.baseURI).host;
        let tocUrl = dom.baseURI.replace("/novel/", "/api/chapters/") + "/";
        let json = (await HttpClient.fetchJson(tocUrl)).json;
        return json.map(j => this.toChapter(j, host));
    }

    toChapter(json, host) {
        return ({
            sourceUrl:  `https://${host}/chapter/${json.novSlugChapSlug}`,
            title: json.title
        });
    }

    findContent(dom) {
        return dom.querySelector("#chapterText")?.parentElement?.parentElement;
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h5");
    }

    removeUnwantedElementsFromContentElement(element) {
        util.removeChildElementsMatchingSelector(element, "div.mantine-Group-root, div.mantine-Container-root");
        super.removeUnwantedElementsFromContentElement(element);
    }

    findChapterTitle(dom) {
        return dom.querySelector("h1");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.mantine-Image-imageWrapper");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll(".mantine-Spoiler-root")];
    }
}
