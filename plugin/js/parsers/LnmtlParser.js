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
parserFactory.register("lnmtl.com", () => createLnmtlParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createLnmtlParserInstance() {
    return new LnmtlParser();
}

class LnmtlParser extends Parser {
    constructor() {
        super();
    }

    populateUIImpl() {
        document.getElementById("removeOriginalRow").hidden = false; 
        document.getElementById("removeTranslatedRow").hidden = false; 
    }
  
    getChapterUrls(dom) {
        let volumesList = LnmtlParser.findVolumesList(dom);
        if (volumesList.length !== 0) {
            return LnmtlParser.fetchChapterLists(volumesList, HttpClient.fetchJson).then(function(lists) {
                return LnmtlParser.mergeChapterLists(lists); 
            });
        }

        let table = dom.querySelector("#volumes-container table");
        return Promise.resolve(util.hyperlinksToChapterList(table));
    }

    findContent(dom) {
        return dom.querySelector("div.chapter-body");
    }

    findChapterTitle(dom) {
        return dom.querySelector("h3.dashhead-title");
    }

    customRawDomToContentStep(chapter, content) {
        for (let s of content.querySelectorAll("sentence")) {
            if (this.userPreferences.removeOriginal.value && s.className === "original") {
                s.remove();
            } else if (this.userPreferences.removeTranslated.value && s.className === "translated") {
                s.remove();
            } else {
                let p = s.ownerDocument.createElement("p");
                p.innerText = s.innerText;
                s.replaceWith(p);
            }
        } 
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.jumbotron.novel");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.description")];
    }

    static findVolumesList(dom) {
        let startString = "lnmtl.volumes = ";
        let scriptElement = util.getElement(dom, "script", e => 0 <= e.textContent.indexOf(startString));
        if (scriptElement !== null) {
            return util.locateAndExtractJson(scriptElement.textContent, startString);
        }
        return []; 
    }

    static fetchChapterLists(volumesList, fetchJson) {
        return Promise.all(
            volumesList.map(volume => LnmtlParser.fetchChapterListsForVolume(volume, fetchJson))
        );
    }

    static fetchChapterListsForVolume(volumeInfo, fetchJson) {
        let restUrl = LnmtlParser.makeChapterListUrl(volumeInfo.id, 1);
        return fetchJson(restUrl).then(function(handler) {
            let firstPage = handler.json;
            let pagesForVolume = [Promise.resolve(handler)];
            for ( let i = 2; i <= firstPage.last_page; ++i) {
                let url = LnmtlParser.makeChapterListUrl(volumeInfo.id, i);
                pagesForVolume.push(fetchJson(url));
            }
            return Promise.all(pagesForVolume);
        });
    }

    static makeChapterListUrl(volumeId, page) {
        return `http://lnmtl.com/chapter?page=${page}&volumeId=${volumeId}`;
    }

    static mergeChapterLists(lists) {
        let chapters = [];
        for (let list of lists) {
            for (let page of list) {
                for (let chapter of page.json.data) {
                    chapters.push({
                        sourceUrl: chapter.site_url,
                        title: "#" + chapter.number + ": " + chapter.title,
                        newArc: null                    
                    });
                }
            }
        }
        return chapters;
    }
}
