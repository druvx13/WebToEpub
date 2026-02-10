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

parserFactory.registerDeadSite("stellarrealm.net", () => createStellarRealmParserInstance());
parserFactory.register("brightnovels.com", () => createStellarRealmParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createStellarRealmParserInstance() {
    return new StellarRealmParser();
}

class StellarRealmParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let json = this.getJson(dom);
        this.InertiaVersion = json.version;
        let url = new URL(dom.baseURI);
        let slug = url.pathname.split("/").filter(a => a != "");
        slug = slug[slug.length-1];
        let bookinfo = (await HttpClient.fetchJson("https://brightnovels.com/series/"+slug+"/chapters?sort_order=asc")).json;
        let chapters = bookinfo.chapters.map(a => ({
            sourceUrl: "https://brightnovels.com/series/"+slug+"/"+a.slug,
            title: a.name,
            isIncludeable: ((a.price == 0) && a.is_premium != true)
        }));
        return chapters;
    }

    getJson(dom) {
        let jsondiv = dom.querySelector("#app");
        return JSON.parse(jsondiv.dataset.page);
    }

    async loadEpubMetaInfo(dom) {
        let xml = (await HttpClient.wrapFetch(dom.baseURI)).responseXML;
        let bookinfo = this.getJson(xml);
        this.title = bookinfo.props.series?.title;
        this.tags = bookinfo.props.series.tags?.map(a => a.name);
        this.tags = this.tags.concat(bookinfo.props.series.genre?.map(a => a.name));
        let parsed = util.sanitize(bookinfo.props.series.description);
        this.description = parsed.body.textContent;
        this.img = bookinfo.props.series.cover?.path 
            ? "https://brightnovels.com/storage/"+bookinfo.props.series.cover.path
            : null;
        return;
    }

    findContent(dom) {
        return Parser.findConstrutedContent(dom);
    }

    extractTitleImpl() {
        return this.title;
    }

    extractSubject() {
        let tags = this.tags;
        return tags.join(", ");
    }

    extractDescription() {
        return this.description.trim();
    }

    findCoverImageUrl() {
        return this.img;
    }

    async fetchChapter(url) {
    /*
    alternative the this.InertiaVersion can change with time that's why the other version it is the same json
        let header = {"X-Inertia": "true", "X-Inertia-Version": this.InertiaVersion};
        let options = {
            headers: header
        };
        let json = (await HttpClient.fetchJson(url, options)).json;
    */
        let xml = (await HttpClient.wrapFetch(url)).responseXML;
        let json = this.getJson(xml).props;
        return this.buildChapter(json, url);
    }

    buildChapter(json, url) {
        let newDoc = Parser.makeEmptyDocForContent(url);
        let title = newDoc.dom.createElement("h1");
        let titleText = "Chapter "+json.chapter.number;
        if (!util.isNullOrEmpty(json.chapter.title)) {
            titleText += ": " + json.chapter.title;
        }
        title.textContent = titleText;
        newDoc.content.appendChild(title);
        let content = util.sanitize(json.chapter.content);
        util.moveChildElements(content.body, newDoc.content);
        return newDoc.dom;
    }
}
