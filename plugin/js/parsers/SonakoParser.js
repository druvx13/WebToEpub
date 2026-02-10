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

parserFactory.register("sonako.wikia.com", () => createSonakoParserInstance());
parserFactory.register("sonako.fandom.com", () => createSonakoParserInstance());

//-----------------------------------------------------------------------------
// class SonakoImageCollector  (derives from ImageCollector)
//-----------------------------------------------------------------------------

class SonakoImageCollector extends BakaTsukiImageCollector {
    constructor() {
        super();
    }

    //  Assume all images can be found on a web page with URL
    //  http://sonako.wikia.com/wiki/File:{data-image-name}
    //  where {data-image-name} is data-image-name element of the img tag.
    //
    extractWrappingUrl(element) {
        let tagName = element.tagName.toLowerCase();
        if (tagName === "a") {
            return element.href;
        }
        let link = element.querySelector("a");
        if (link !== null) {
            return link.href;
        }
        let img = (tagName === "img") ? element : element.querySelector("img");
        let dataImageName = img.getAttribute("data-image-name");

        // ToDo, use utilresolveRelativeUrl() rather than string concatanation
        return (dataImageName === null) ? img.src : "http://sonako.wikia.com/wiki/File:" + dataImageName;
    }

    isImageWrapperElement(element) {
        return (element.tagName === "FIGURE") ||  super.isImageWrapperElement(element);
    }
}

//-----------------------------------------------------------------------------
// class SonakoParser
//-----------------------------------------------------------------------------

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createSonakoParserInstance() {
    return new SonakoParser();
}

class SonakoParser extends BakaTsukiParser {
    constructor() {
        super(new SonakoImageCollector());
    }

    extractTitleImpl(dom) {
        return dom.title;
    }

    extractLanguage(dom) {   // eslint-disable-line no-unused-vars
        // ToDo find language
        return "vi-VN";
    }

    extractSeriesInfo(dom, metaInfo) {   // eslint-disable-line no-unused-vars
        // This parser does not currently support this functionality
    }

    // find the node(s) holding the story content
    findContent(dom) {
        return dom.querySelector("div.mw-content-ltr");
    }

    removeUnwantedElementsFromContentElement(element) {
        util.removeElements(element.querySelectorAll("script, " +
            "noscript, " +

        // discard table of contents (will generate one from tags later)
            "div#toc-wrapper, " +
            "a.toc-link, " +

            "a.wikia-photogallery-add, " +
            "div.print-no"
        ));
        util.removeElements(util.getElements(element, "div", e => (e.id.startsWith("INCONTENT"))));


        util.removeComments(element);
        // hyperlinks that allow editing text
        util.removeElements(element.querySelectorAll("table, span.editsection"));

        // fix source for delay loaded image tags
        util.fixDelayLoadedImages(element, "data-src");
    }
}
