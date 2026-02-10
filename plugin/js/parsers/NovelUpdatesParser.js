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

parserFactory.register("novelupdates.com", () => createNovelUpdatesParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createNovelUpdatesParserInstance() {
    return new NovelUpdatesParser();
}

class NovelUpdatesParser extends Parser {
    constructor() {
        super();
    }

    // returns promise with the URLs of the chapters to fetch
    // promise is used because may need to fetch the list of URLs from internet
    getChapterUrls(dom) {
        return NovelUpdatesParser.fetchChapterUrls(dom).then(function(links) {
            let chapters = links.map(l => util.hyperLinkToChapter(l));
            return Promise.resolve(chapters.reverse());
        });
    }

    static fetchChapterUrls(dom) {
        let extraPagesWithToc = NovelUpdatesParser.findPagesWithToC(dom);
        return Promise.all(
            extraPagesWithToc.map(url => NovelUpdatesParser.fetchChapterListFromPage(url))
        ).then(function(chapterLists) {
            return chapterLists.reduce(function(prev, current) {
                return prev.concat(current);
            }, NovelUpdatesParser.chapterLinksFromDom(dom));
        });
    }

    static fetchChapterListFromPage(url) {
        return HttpClient.wrapFetch(url).then(function(xhr) {
            return Promise.resolve(NovelUpdatesParser.chapterLinksFromDom(xhr.responseXML));
        });
    }

    static chapterLinksFromDom(dom) {
        return [...dom.querySelectorAll("table#myTable tbody tr")]
            .map(NovelUpdatesParser.chapterLinksFromRow)
            .filter(l => l !== null);
    }

    static chapterLinksFromRow(row) {
        let links = [...row.querySelectorAll("a")];
        return (0 < links.length) ? links[links.length - 1] : null;
    }
    
    static findPagesWithToC(dom) {
        let urls = [];
        let div = dom.querySelector("div.digg_pagination");
        if (div !== null) {
            let maxPage = NovelUpdatesParser.getPageValueOfLastTocPage(div);
            for (let i = 2; i <= maxPage; ++i) {
                urls.push(dom.baseURI + "?pg=" + i);
            }
        }
        return urls;
    }

    static getPageValueOfLastTocPage(div) {
        return [...div.querySelectorAll("a")].reduce(function(prev, curr) {
            let t = NovelUpdatesParser.getPageSearchParameter(curr);
            return (t > prev) ? t : prev;
        }, -1);
    }

    static getPageSearchParameter(link) {
        let query = link.search;
        if (query.startsWith("?pg=")) {
            return parseInt(query.substring(4));
        }
    } 

    // returns the element holding the story content in a chapter
    findContent(dom) {
        return dom.body;
    }

    // title of the story
    extractTitleImpl(dom) {
        return dom.querySelector("div.seriestitlenu");
    }

    // author of the story
    extractAuthor(dom) {
        let author = dom.querySelector("div#showauthors a");
        return (author !== null) ? author.textContent : super.extractAuthor(dom);
    }
}
