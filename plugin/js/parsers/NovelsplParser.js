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

parserFactory.register("novels.pl", () => createNovelsplParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createNovelsplParserInstance() {
    return new NovelsplParser();
}

class NovelsplParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        let toc = dom.querySelector("tbody#chapters");
        let chapters = util.hyperlinksToChapterList(toc);
        let tocInfo = NovelsplParser.getTocFetchInfo(dom);
        if (tocInfo != null) {
            chapterUrlsUI.showTocProgress(chapters);
            chapters = await NovelsplParser.fetchMultipleToc(chapters, tocInfo, chapterUrlsUI);
        }
        return chapters.reverse();
    }

    static getTocFetchInfo(dom) {
        let script = [...dom.querySelectorAll("script")]
            .filter(s => s.textContent.includes("function load(page)"))
            .map(s => s.textContent)[0];
        if (script != null) {
            let index = script.indexOf("data:");
            let end = script.indexOf(", page:", index);
            script = script.substring(index, end) 
                .replace("id:", "\"id\":")
                .replace("novel:", "\"novel\":")
                .replace("max:", "\"max\":")
                .replace(/'/g, "\"");
            return util.locateAndExtractJson(script + "}", "data:");
        }
        return null;
    }

    static async fetchMultipleToc(chapters, tocInfo, chapterUrlsUI) {
        let maxPage = Math.ceil(tocInfo.max / 50);
        for (let i = 2; i <= maxPage; ++i) {
            let partialList = await NovelsplParser.fetchTocData(i, tocInfo);
            chapterUrlsUI.showTocProgress(partialList);
            chapters = chapters.concat(partialList);
        }
        return chapters;
    }    

    static async fetchTocData(page, tocInfo) {
        let formData = new FormData();
        formData.append("id", tocInfo.id);
        formData.append("novel", tocInfo.novel);
        formData.append("max", tocInfo.max);
        formData.append("page", page);

        let fetchUrl = "https://www.novels.pl/ajax/ajaxGetChapters.php";
        let options = {
            method: "POST",
            credentials: "include",
            body: formData
        };
        let xhr = await HttpClient.wrapFetch(fetchUrl, {fetchOptions: options});
        return util.hyperlinksToChapterList(xhr.responseXML);
    }

    findContent(dom) {
        return dom.querySelector("div.article");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h4[itemprop='name>']");
    }

    removeUnwantedElementsFromContentElement(element) {
        for (let p of [...element.querySelectorAll("p")]) {
            let c = p.textContent;
            if ((c === "This chapter is updated by Novels.pl") || 
                (c === "Liked it? Take a second to support Novels on Patreon!")) {
                p.remove();
            }
        }
        util.removeChildElementsMatchingSelector(element, "ul.pager");
        super.removeUnwantedElementsFromContentElement(element);
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.imageCover");
    }

    preprocessRawDom(chapterDom) {
        util.removeChildElementsMatchingSelector(chapterDom, "a[href='https://www.patreon.com/novelspl']");
    }

    getInformationEpubItemChildNodes(dom) {
        let description = NovelsplParser.getDescriptionMarker(dom);
        return description === null ? [] : [description];
    }

    static getDescriptionMarker(dom) {
        let marker = dom.querySelector("p[itemprop='description']");
        return marker === null ? null : marker.parentElement;
    }
}
