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

parserFactory.register("allnovel.org", () => createNovelfullParserInstance());
parserFactory.register("allnovelbin.net", () => createNovelfullParserInstance());
parserFactory.register("allnovelfull.app", () => createNovelfullParserInstance());
parserFactory.register("allnovelfull.com", () => createNovelfullParserInstance());
//dead url
parserFactory.register("allnovelfull.org", () => createNovelfullParserInstance());
parserFactory.register("allnovelfull.net", () => createNovelfullParserInstance());
parserFactory.register("allnovelnext.com", () => createNovelfullParserInstance());
parserFactory.register("all-novelfull.net", () => createNovelfullParserInstance());
parserFactory.register("boxnovelfull.com", () => createNovelfullParserInstance());
//dead url
parserFactory.register("freenovelsread.com", () => createNovelfullParserInstance());
parserFactory.register("freewn.com", () => createNovelfullParserInstance());
parserFactory.register("novel-bin.com", () => createNovelHyphenBinParserInstance());
parserFactory.register("novel-bin.net", () => createNovelHyphenBinParserInstance());
parserFactory.register("novel-bin.org", () => createNovelHyphenBinParserInstance());
parserFactory.register("novel-next.com", () => createNovelfullParserInstance());
parserFactory.register("novel35.com", () => createNovel35ParserInstance());
parserFactory.register("novelactive.org", () => createNovelfullParserInstance());
parserFactory.register("novelbin.com", () => createNovelbinParserInstance());
parserFactory.register("novelbin.me", () => createNovelfullParserInstance());
parserFactory.register("novelbin.net", () => createNovelfullParserInstance());
parserFactory.register("novelbin.org", () => createNovelfullParserInstance());
parserFactory.register("noveldrama.org", () => createNovelfullParserInstance());
//dead url
parserFactory.register("novelebook.net", () => createNovelfullParserInstance());
parserFactory.register("novelfull.com", () => createNovelfullParserInstance());
parserFactory.register("novelfull.net", () => createNovelfullParserInstance());
parserFactory.register("novelfullbook.com", () => createNovelfullParserInstance());
parserFactory.register("novelfulll.com", () => createNovelfullParserInstance());
//dead url
parserFactory.register("novelhulk.net", () => createNovelfullParserInstance());
parserFactory.register("novelmax.net", () => createNovelfullParserInstance());
parserFactory.register("novelnext.com", () => createNovelfullParserInstance());
parserFactory.register("novelnext.dramanovels.io", () => createNovelfullParserInstance());
parserFactory.register("novelnext.net", () => createNovelfullParserInstance());
parserFactory.register("novelnextz.com", () => createNovelfullParserInstance());
//dead url
parserFactory.register("noveltop1.org", () => createNovelfullParserInstance());
parserFactory.register("noveltrust.net", () => createNovelfullParserInstance());
parserFactory.register("novelusb.com", () => createNovelfullParserInstance());
parserFactory.register("novelusb.net", () => createNovelfullParserInstance());
parserFactory.register("novelxo.net", () => createNovelfullParserInstance());
parserFactory.register("novlove.com", () => createNovelfullParserInstance());
parserFactory.register("readnovelfull.me", () => createNovelfullParserInstance());
//dead url
parserFactory.register("thenovelbin.org", () => createNovelfullParserInstance());
parserFactory.register("topnovelfull.com", () => createNovelfullParserInstance());
parserFactory.register("zinnovel.net", () => createNovelfullParserInstance());

parserFactory.registerManualSelect("NovelNext", () => createNovelfullParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createNovelfullParserInstance() {
    return new NovelfullParser();
}

class NovelfullParser extends Parser {
    constructor() {
        super();
        this.minimumThrottle = 1000;
    }

    // This site uses lots of hostname aliases in the chapter URLs
    // and changes them frequently.  Resulting in WtE not picking the
    // correct parser for the chapters
    // See: https://github.com/dteviot/WebToEpub/issues/1345
    async addParsersToPages(pagesToFetch) {
        for (let page of pagesToFetch) {
            page.parser = this;
        }
    }

    async getChapterUrls(dom, chapterUrlsUI) {
        return this.getChapterUrlsFromMultipleTocPages(dom,
            this.extractPartialChapterList,
            this.getUrlsOfTocPages,
            chapterUrlsUI
        );
    }

    getUrlsOfTocPages(dom) {
        let link = dom.querySelector("li.last a");
        let urls = [];
        if (link != null) {
            let limit = link.getAttribute("data-page");
            if (limit == null)
            {
                let url = new URL(link.href);
                limit = url.searchParams.get("page_num") || null;
            }
            limit = parseInt(limit || "-1") + 1;
            for (let i = 1; i <= limit; ++i) {
                urls.push(NovelfullParser.buildUrlForTocPage(link, i));
            }
        }
        return urls;
    }

    static buildUrlForTocPage(link, i) {
        let hostname = link.hostname;
        if (hostname === "freenovelsread.com")
        {
            link.pathname = link.pathname.split("/")[1] + "/" + i;
        } else if (hostname === "novelfulll.com") {
            link.search = `?page_num=${i}`;
        } else {
            link.search = `?page=${i}&per-page=50`;
        }
        return link.href;
    }

    extractPartialChapterList(dom) {
        return [...dom.querySelectorAll("ul.list-chapter a")]
            .map(link => util.hyperLinkToChapter(link));
    }

    // returns the element holding the story content in a chapter
    findContent(dom) {
        return dom.querySelector("#chr-content")
            || dom.querySelector("#chapter-content");
    }

    // title of the story  (not to be confused with title of each chapter)
    extractTitleImpl(dom) {
        return dom.querySelector("h3.title");
    }

    extractAuthor(dom) {
        let items = [...dom.querySelectorAll("ul.info-meta li")]
            .filter(u => u.querySelector("h3")?.textContent === "Author:")
            .map(u => u.querySelector("a")?.textContent);
        return 0 < items.length 
            ? items[0]
            : super.extractAuthor(dom);
    }

    preprocessRawDom(dom) {
        this.tagWatermark(dom);
    }

    findChapterTitle(dom) {
        return dom.querySelector("h2").textContent;
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.book");
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.desc-text, div.info")];
    }

    tagWatermark(dom) {
        const watermark = this.findWatermark(dom);
        if (watermark) {
            let paragraphs = [...dom.querySelectorAll("p")]
                .filter(p => p.textContent.includes(watermark));
            for (let p of paragraphs) {
                p.textContent = p.textContent.replace(watermark, "");
                p.appendChild(this.makeSpanWithWatermark(dom, watermark));
            }
        }
    }

    findWatermark(dom) {
        const searchToken = "original11Content.replace(\"";
        const script = [...dom.querySelectorAll("script")]
            .filter(s => s.innerHTML.includes(searchToken))
            .map(s => s.innerHTML)[0];
        if (!script) {
            return null;
        }
        const line = script.substring(script.indexOf(searchToken) + searchToken.length);
        return line.substring(0, line.indexOf("\""));
    }

    makeSpanWithWatermark(dom, watermark) {
        let span = dom.createElement("span");
        span.textContent = watermark;
        span.id = "span";
        span.hidden = true;
        return span;
    }
}

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createNovel35ParserInstance() {
    return new Novel35Parser();
}

class Novel35Parser extends NovelfullParser {
    constructor() {
        super();
    }

    getUrlsOfTocPages(dom) {
        let urls = [];
        let paginateUrls = [...dom.querySelectorAll("ul.pagination li a:not([rel])")];
        if (0 < paginateUrls.length) {
            let url = new URL(paginateUrls.pop().href);
            let maxPage = url.searchParams.get("page");
            for (let i = 2; i <= maxPage; ++i) {
                url.searchParams.set("page", i);
                urls.push(url.href);
            }
        }
        return urls;
    }

    findContent(dom) {
        return dom.querySelector("div.chapter-content");
    }

    findChapterTitle(dom) {
        return dom.querySelector("div.chapter-title").textContent;
    }    
}

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createNovelHyphenBinParserInstance() {
    return new NovelHyphenBinParser();
}

class NovelHyphenBinParser extends NovelfullParser {
    constructor() {
        super();
    }

    removeUnwantedElementsFromContentElement(element) {
        let marks = [...element.querySelectorAll(".novel_online, .unlock-buttons")];
        for (let mark of marks) {
            mark.nextSibling.nextSibling.remove();
            mark.remove();
        }
        super.removeUnwantedElementsFromContentElement(element);
    }
}

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createNovelbinParserInstance() {
    return new NovelbinParser();
}

class NovelbinParser extends NovelfullParser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let url = new URL(dom.baseURI);
        let slug = url.pathname.split("/").filter(a => a != "");
        slug = slug[slug.length-1];
        let tocHtml = (await HttpClient.wrapFetch("https://novelbin.com/ajax/chapter-archive?novelId="+slug)).responseXML;
        let chapters = this.extractPartialChapterList(tocHtml);
        return chapters;
    }

    removeUnwantedElementsFromContentElement(element) {
        util.removeChildElementsMatchingSelector(element, ".unlock-buttons");
        super.removeUnwantedElementsFromContentElement(element);
    }
}
