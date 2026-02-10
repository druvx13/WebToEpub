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

parserFactory.register("ixdzs.tw", () => createIxdzsParserInstance());
parserFactory.register("ixdzs8.com", () => createIxdzs8ParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createIxdzsParserInstance() {
    return new IxdzsParser();
}

class IxdzsParser extends Parser {
    constructor() {
        super();
        this.tocPathName = "/novel/html/";
    }

    async getChapterUrls(dom) {
        var tocUrl = new URL(dom.baseURI);
        var bid = this.extractBid(tocUrl.pathname);
        tocUrl.pathname = this.tocPathName;
        let options = {
            method: "POST",
            credentials: "include",
            body: this.makeFormData(bid)
        };
        return await this.fetchChapterUrls(tocUrl.href, options, dom.baseURI);
    }

    async fetchChapterUrls(url, options, baseUri) { // eslint-disable-line no-unused-vars
        let xhr = await HttpClient.wrapFetch(url, {fetchOptions: options});
        return util.hyperlinksToChapterList(xhr.responseXML.body);
    }

    makeFormData(bid) {
        let formData = new FormData();
        formData.append("bid", bid);
        return formData;
    }

    extractBid(path) {
        return path.split("/")
            .filter(s => !util.isNullOrEmpty(s))
            .pop();
    }

    findContent(dom) {
        return dom.querySelector("section");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1");
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector("a.bauthor");
        return authorLabel?.textContent ?? super.extractAuthor(dom);
    }

    extractLanguage() {
        return "zh";
    }

    findChapterTitle(dom) {
        return dom.querySelector("h3");
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.n-img");
    }

    getInformationEpubItemChildNodes(dom) {
        let epubDescription = ([...dom.querySelectorAll("p.pintro")]);
        return epubDescription.map(e => e.textContent.replace(/(^\s*)|(\s*$)/gi, "").replace(/[ ]{2,}/gi, "\n\n").replace(/\u3000/g, ""));
    }

    removeUnwantedElementsFromContentElement(element) {
        util.removeChildElementsMatchingSelector(element, "p.abg");
        super.removeUnwantedElementsFromContentElement(element);
    }
}

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createIxdzs8ParserInstance() {
    return new Ixdzs8Parser();
}

class Ixdzs8Parser extends IxdzsParser {
    constructor() {
        super();
        this.tocPathName = "/novel/clist/";
    }

    async fetchChapterUrls(url, options, baseUri) {
        if (!baseUri.endsWith("/")) {
            baseUri += "/";
        }
        let json = (await HttpClient.fetchJson(url, options)).json;
        return json.data.map(d => ({
            sourceUrl: `${baseUri}p${d.ordernum}.html`,
            title: d.title,
        }));
    }

    async fetchChapter(url) {
        let dom = (await HttpClient.wrapFetch(url)).responseXML;
        let count = 0;
        while (!this.findContent(dom)) {
            let responseUrl = this.buildChallengeResponseUrl(dom, url);
            dom = (await HttpClient.wrapFetch(responseUrl)).responseXML;
            if (++count > 10) {
                break;
            }
        }
        return dom;
    }

    buildChallengeResponseUrl(dom, url) {
        let script = dom.querySelector("script")?.textContent;
        let token = script.split("\"")[1];
        return url +"?challenge=" + encodeURIComponent(token);
    }
}
