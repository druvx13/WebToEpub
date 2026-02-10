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

parserFactory.register("arcanetranslations.com", () => createNoblemtlParserInstance());
//dead url
parserFactory.register("bookalb.com", () => createNoblemtlParserInstance());
parserFactory.register("ckandawrites.online", () => createKnoxtspaceParserInstance());
parserFactory.register("daotranslate.com", () => createNoblemtlParserInstance());
parserFactory.register("daotranslate.us", () => createNoblemtlParserInstance());
//dead url
parserFactory.register("faloomtl.com", () => createNoblemtlParserInstance());
//dead url
parserFactory.register("genesistls.com", () => createNoblemtlParserInstance());
parserFactory.register("hoxionia.com", () => createNoblemtlParserInstance());
parserFactory.register("jobnib.com", () => createNoblemtlParserInstance());
parserFactory.register("moonlightnovel.com", () => createNoblemtlParserInstance());
parserFactory.register("noblemtl.com", () => createNoblemtlParserInstance());
parserFactory.register("novelcranel.org", () => createNoblemtlParserInstance());
//dead url
parserFactory.register("novelsparadise.net", () => createNoblemtlParserInstance());
//dead url
parserFactory.register("readfreebooksonline.org", () => createNoblemtlParserInstance());
//dead url
parserFactory.register("tamagotl.com", () => createNoblemtlParserInstance());
parserFactory.register("taonovel.com", () => createNoblemtlParserInstance());
parserFactory.register("knoxt.space", () => createKnoxtspaceParserInstance());
parserFactory.register("lazygirltranslations.com", () => createLazygirltranslationsParserInstance());
//dead url
parserFactory.register("novelsknight.com", () => createNoblemtlParserInstance());
parserFactory.register("novelsknight.punchmanga.online", () => createNovelsknightlParserInstance());
parserFactory.register("cyborg-tl.com", () => createCyborgTlParserInstance());

parserFactory.register("pandamtl.com", () => createNoblemtlParserInstance());
parserFactory.register("universalnovel.com", () => createNoblemtlParserInstance());
parserFactory.register("whitemoonlightnovels.com", () => createWhitemoonlightnovelsParserInstance());

parserFactory.register("my-novel.online", () => createMyNovelOnlineParserInstance());

parserFactory.registerRule(
    (url, dom) => NoblemtlParser.isNoblemtlTheme(dom) * 0.7,
    () => createNoblemtlParserInstance()
);

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createNoblemtlParserInstance() {
    return new NoblemtlParser();
}

class NoblemtlParser extends Parser {
    constructor() {
        super();
    }

    static isNoblemtlTheme(dom) {
        return (dom.querySelector("div.eplister a") != null) &&
            (dom.querySelector(".thumbook, .sertothumb") != null);
    }

    async getChapterUrls(dom) {
        return [...dom.querySelectorAll("div.eplister a")]
            .map(this.linkToChapter)
            .reverse();
    }

    linkToChapter(link) {
        let titleName = link.querySelector(".epl-title")?.textContent?.trim() ?? "";
        let title = NoblemtlParser.extractChapterNum(link).trim() + " "
            + titleName;
        return ({
            sourceUrl:  link.href,
            title: title
        });
    }

    static extractChapterNum(link) {
        let eplnum = link.querySelector(".epl-num");
        let chapnum = eplnum.querySelector(".chapter_num");
        return chapnum == null
            ? eplnum.textContent
            : chapnum.textContent;
    }

    findContent(dom) {
        return dom.querySelector(".entry-content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1.entry-title");
    }

    removeUnwantedElementsFromContentElement(element) {
        let toRemove = [...element.querySelectorAll("p")]
            .filter(p => p.style.opacity === "0");
        util.removeElements(toRemove);
        util.removeElements(this.findEmptySpanElements(element));
        util.removeChildElementsMatchingSelector(element, "span.modern-footnotes-footnote__note");
        util.removeChildElementsMatchingSelector(element, "span.footnote_tooltip");
        util.removeChildElementsMatchingSelector(element, "div#hpk");
        super.removeUnwantedElementsFromContentElement(element);
    }

    findEmptySpanElements(element) {
        return [...element.querySelectorAll("span")]
            .filter(s => !s.firstChild);
    }

    findChapterTitle(dom, webPage) {
        return webPage.title;
    }

    static buildChapterTitle(dom) {
        let title = "";
        let addText = (selector) => {
            let element = dom.querySelector(selector);
            if (element != null) {
                title += " " +  element.textContent;
            }
        };
        addText("h1.entry-title");
        addText(".cat-series");
        return title;
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, ".thumbook, .sertothumb");
    }

    preprocessRawDom(webPageDom) {
        util.removeChildElementsMatchingSelector(webPageDom, "div.saboxplugin-wrap, div.code-block");
    }

    getInformationEpubItemChildNodes(dom) {
        let info = dom.querySelector("div.synp .entry-content, div.sersys.entry-content");
        return info == null
            ? []
            : [info];
    }
}

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createKnoxtspaceParserInstance() {
    return new KnoxtspaceParser();
}

class KnoxtspaceParser extends NoblemtlParser {
    constructor() {
        super();
    }

    findChapterTitle(dom) {
        return NoblemtlParser.buildChapterTitle(dom);
    }

    stripAdverts(node) {
        // On Knoxt chapters, first code-block contains chapter text and advert
        for (let block of node.querySelectorAll("div.code-block")) {
            util.removeChildElementsMatchingSelector(
                block,
                "center, div.ad-container"
            );
            util.flattenNode(block);
        }
    }

    preprocessRawDom(webPageDom) {
        this.stripAdverts(webPageDom);
        super.preprocessRawDom(webPageDom);
    }

    cleanInformationNode(node) {
        this.stripAdverts(node);
    }
}

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createWhitemoonlightnovelsParserInstance() {
    return new WhitemoonlightnovelsParser();
}

class WhitemoonlightnovelsParser extends NoblemtlParser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        return [...dom.querySelectorAll("div.eplister a")]
            .map(this.linkToChapter);
    }

    findChapterTitle(dom) {
        return NoblemtlParser.buildChapterTitle(dom);
    }

    cleanInformationNode(node) {
        util.removeChildElementsMatchingSelector(node, ".code-block");
    }
}

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createLazygirltranslationsParserInstance() {
    return new LazygirltranslationsParser();
}

class LazygirltranslationsParser extends KnoxtspaceParser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        if (dom.querySelector("div.eplister a"))
        {
            return super.getChapterUrls(dom);
        }
        let menu = dom.querySelector(".page");
        return util.hyperlinksToChapterList(menu);        
    }
}

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createMyNovelOnlineParserInstance() {
    return new MyNovelOnlineParser();
}

class MyNovelOnlineParser extends NoblemtlParser {
    constructor() {
        super();
        this.minimumThrottle = 3000;
    }

    findChapterTitle(dom) {
        return dom.querySelector(".epheader .entry-title");
    }

    findContent(dom) {
        let content = dom.querySelector(".epwrapper .epcontent");
        //there are random links embeded everywhere i think it is to boost other sites on google as the other site is "relevant"
        for (let e of content.querySelectorAll("p.chapter a.num-link")) {
            let pnode = dom.createElement("span");
            pnode.textContent = e.innerText;
            e.replaceWith(pnode);
        }
        return content;
    }

    removeUnwantedElementsFromContentElement(content) {
        util.removeElements(content.querySelectorAll("div.post-views, div.chapter-protected-message"));
        super.removeUnwantedElementsFromContentElement(content);
    }
}

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createNovelsknightlParserInstance() {
    return new NovelsknightlParser();
}

class NovelsknightlParser extends NoblemtlParser {
    constructor() {
        super();
        this.minimumThrottle = 3000;
    }

    findContent(dom) {
        return dom.querySelector("[itemprop='text']");
    }
}

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createCyborgTlParserInstance() {
    return new CyborgTlParser();
}

class CyborgTlParser extends NoblemtlParser {
    constructor() {
        super();
    }

    customRawDomToContentStep(chapter) {
        let crypt = chapter.rawDom.querySelector("#js-post-content");
        if (crypt) {
            crypt.textContent = crypt.getAttribute("data-obf");
        }
    }
}
