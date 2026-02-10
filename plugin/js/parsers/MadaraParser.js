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

parserFactory.register("listnovel.com", () => createMadaraParserInstance());
//dead url
parserFactory.register("readwebnovel.xyz", () => createMadaraParserInstance());
parserFactory.register("wuxiaworld.site", () => createMadaraParserInstance());
//dead url
parserFactory.register("pery.info", () => createMadaraParserInstance());
parserFactory.register("morenovel.net", () => createMadaraParserInstance());
parserFactory.register("nightcomic.com", () => createMadaraParserInstance());
//dead url
parserFactory.register("webnovel.live", () => createMadaraParserInstance());
//dead url
parserFactory.register("noveltrench.com", () => createMadaraParserInstance());
parserFactory.register("mangasushi.net", () => createMadaraParserInstance());
//dead url
parserFactory.register("mangabob.com", () => createMadaraParserInstance());
parserFactory.register("greenztl2.com", () => createMadaraVariantParserInstance());

parserFactory.register("indratranslations.com", () => createKdtnovelsParserInstance());
parserFactory.register("kdtnovels.com", () => createKdtnovelsParserInstance());

parserFactory.registerRule(
    (url, dom) => MadaraParser.isMadaraTheme(dom) * 0.6,
    () => createMadaraParserInstance()
);

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createMadaraParserInstance() {
    return new MadaraParser();
}

class MadaraParser extends WordpressBaseParser {
    constructor() {
        super();
    }

    static isMadaraTheme(dom) {
        return 0 < dom.querySelectorAll("li.wp-manga-chapter a").length;
    }

    async getChapterUrls(dom) {
        return [...dom.querySelectorAll("li.wp-manga-chapter a:not([title])")]
            .map(a => util.hyperLinkToChapter(a)).reverse();
        //if single chapter result, try MadaraVariantParser logic.
    }

    findContent(dom) {
        let content =
            dom.querySelector(".reading-content .text-left") ||
            dom.querySelector("div.reading-content");

        for (let i of content.querySelectorAll("img")) {
            let data_src = i.getAttribute("data-src");
            if (!util.isNullOrEmpty(data_src) && util.isNullOrEmpty(i.src)) {
                i.src = data_src.trim();
            }
        }
        return content;
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector("div.author-content a");
        return (authorLabel === null) ? super.extractAuthor(dom) : authorLabel.textContent;
    }
	
    extractSubject(dom) {
        let tags = [...dom.querySelectorAll("div .genres-content [rel='tag']")];
        return tags.map(e => e.textContent.trim()).join(", ");
    }

    extractDescription(dom) {
        let descriptionElement = dom.querySelector(".summary__content");
        return descriptionElement === null ? "" : descriptionElement.textContent.trim();
    }
    

    removeUnwantedElementsFromContentElement(element) {
        util.removeChildElementsMatchingSelector(element, "div.addtoany_share_save_container");
        super.removeUnwantedElementsFromContentElement(element);
    }

    findChapterTitle(dom) {
        return dom.querySelector("ol.breadcrumb li.active, .wp-manga-chapter.reading a").textContent;
    }
 
    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.summary_image");
    }

    getInformationEpubItemChildNodes(dom) {
        let nodes = [...dom.querySelectorAll("div.summary__content")];
        if (nodes.length === 0) {
            nodes = [...dom.querySelectorAll("div.manga-summary p")];
        }
        if (nodes.length === 0) {
            nodes = [...dom.querySelectorAll("div.excerpt-content p")];
        }
        return nodes;
    }

    cleanInformationNode(node) {
        util.removeChildElementsMatchingSelector(node, "script");
    }
}

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createMadaraVariantParserInstance() {
    return new MadaraVariantParser();
}

class MadaraVariantParser extends MadaraParser {
    async getChapterUrls(dom) {
        return [...dom.querySelectorAll("li.wp-manga-chapter a:not([title], [data-locked='1'])")]
            .map(a => this.hyperLinkToChapter(a)).reverse();
    }

    hyperLinkToChapter(link, newArc) {
        let retVal = util.hyperLinkToChapter(link, newArc);
        let uri = retVal.sourceUrl;
        if (!uri || link.attributes.href.value == "#") //search for alternate URLs if typical link fails
        {
            uri = null;
            if (link.dataset.link)
            {
                retVal.sourceUrl = link.dataset.link;
            }
            else
            {
                [...link.attributes].forEach(attr => {
                    try {
                        uri = new URL(attr.value);
                    } catch (_)
                    {
                        //Failed to detect URL in Attribute.
                    }
                });
                if (uri && uri.href)
                {
                    retVal.sourceUrl = uri.href;
                }
            }
        }

        return retVal;
    }
    
    findChapterTitle(dom) {
        return dom.querySelector(".main-col h1:not(.menu-title)").textContent;
    }
}

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createKdtnovelsParserInstance() {
    return new KdtnovelsParser();
}

class KdtnovelsParser extends MadaraParser {
    findChapterTitle(dom) {
        return dom.querySelector("h3.chapter-name");
    }
}
