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

parserFactory.registerManualSelect(
    "Baka-Tsuki Series Page", 
    () => createBakaTsukiSeriesPageParserInstance()
);

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createBakaTsukiSeriesPageParserInstance() {
    return new BakaTsukiSeriesPageParser();
}

class BakaTsukiSeriesPageParser extends Parser {
    constructor() {
        super(new BakaTsukiImageCollector());
    }

    static register() {
        parserFactory.reregister(
            "baka-tsuki.org", 
            function(url) {
                if (BakaTsukiSeriesPageParser.isFullTextPage(url)) {
                    return new BakaTsukiParser(new BakaTsukiImageCollector());
                } else {
                    return new BakaTsukiSeriesPageParser();
                }
            }
        );
    }

    static registerBakaParsers(includeSeriesPage) {
        if (includeSeriesPage) {
            BakaTsukiSeriesPageParser.register();
        } else {
            BakaTsukiParser.register();
        }
    }

    static isFullTextPage(url) {
        let param = util.getParamFromUrl(url, "title");
        return param.includes(":");
    }

    getChapterUrls(dom) {
        let menu = dom.querySelector("div#content");
        return Promise.resolve(util.hyperlinksToChapterList(menu, 
            BakaTsukiSeriesPageParser.possibleChapterLink));
    }

    static possibleChapterLink(link) {
        let href = link.href;
        return !href.includes("#") && !href.includes("redlink=1");
    }

    findContent(dom) {
        return dom.querySelector("div#mw-content-text");
    }

    populateUIImpl() {
        document.getElementById("highestResolutionImagesRow").hidden = false;
        document.getElementById("unSuperScriptAlternateTranslations").hidden = false; 
        document.getElementById("translatorRow").hidden = false;
        document.getElementById("fileAuthorAsRow").hidden = false;
    }

    // title of the story  (not to be confused with title of each chapter)
    extractTitleImpl(dom) {
        return dom.querySelector("#firstHeading");
    }

    customRawDomToContentStep(chapter, content) {
        BakaTsukiParser.stripGalleryBox(content);
        if (this.userPreferences.unSuperScriptAlternateTranslations.value) {
            BakaTsukiParser.unSuperScriptAlternateTranslations(content);
        }
    }

    removeUnwantedElementsFromContentElement(element) {
        util.removeElements(element.querySelectorAll("div#toc, div#printfooter"));

        // remove "Jump Up" text that appears beside the up arrow from translator notes
        util.removeElements(element.querySelectorAll("span.cite-accessibility-label"));

        BakaTsukiParser.removeUnwantedTable(element);

        // hyperlinks that allow editing text
        util.removeElements(element.querySelectorAll("span.mw-editsection"));
        super.removeUnwantedElementsFromContentElement(element);
    }

    findChapterTitle(dom) {
        return dom.querySelector("#firstHeading");
    }    
}
