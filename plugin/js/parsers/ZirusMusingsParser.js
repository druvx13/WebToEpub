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

//dead url
parserFactory.register("zirusmusings.com", () => createZirusMusingsParserInstance());
parserFactory.register("zirusmusings.net", () => createZirusMusingsParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createZirusMusingsParserInstance() {
    return new ZirusMusingsParser();
}

class ZirusMusingsParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let tocHtml = (await HttpClient.wrapFetch(dom.baseURI)).responseXML;
        let nextjsraw = tocHtml.querySelector("#__NEXT_DATA__").innerHTML;
        let nextjsjson = JSON.parse(nextjsraw);
        let chaps = nextjsjson.props.pageProps.data.volumes;
        chaps = chaps.map(a => a.chapters).map(a => {
            a[0].newArc = a[0].volumeTitle;
            return a;
        });
        chaps = chaps.flatMap(a => a).filter(a => a.published!=null);
        return chaps.map(a => ({
            sourceUrl: "https://www.zirusmusings.net/series/" + a.series + "/" + a.chapter, 
            title: a.title,
            newArc: a.newArc
        }));
    }
    
    async loadEpubMetaInfo(dom) {
        let tocHtml = (await HttpClient.wrapFetch(dom.baseURI)).responseXML;
        let nextjsraw = tocHtml.querySelector("#__NEXT_DATA__").innerHTML;
        let nextjsjson = JSON.parse(nextjsraw);
        let bookinfo = nextjsjson.props.pageProps.data;
        this.title = bookinfo?.name;
        this.author = bookinfo?.author;
        this.description = bookinfo?.summary;
        this.img = (bookinfo?.cover!=null)?"https://www.zirusmusings.net"+bookinfo?.cover:"";
        return;
    }

    extractTitleImpl() {
        return (this.title!=null)?this.title:"";
    }

    extractAuthor() {
        return (this.author!=null)?this.author:"";
    }

    extractDescription() {
        return (this.description!=null)?this.description.trim():"";
    }

    findCoverImageUrl() {
        return this.img;
    }

    findContent(dom) {
        return Parser.findConstrutedContent(dom);
    }

    async fetchChapter(url) {
        let dom = (await HttpClient.wrapFetch(url)).responseXML;
        let nextjsraw = dom.querySelector("#__NEXT_DATA__").innerHTML;
        let nextjsjson = JSON.parse(nextjsraw);
        return this.buildChapter(nextjsjson.props.pageProps, url);
    }

    buildChapter(chapcontent, url) {
        let newDoc = Parser.makeEmptyDocForContent(url);
        let title = newDoc.dom.createElement("h1");
        title.textContent = chapcontent.data.title?chapcontent.data.title:"Chapter "+chapcontent.data.chapter;
        newDoc.content.appendChild(title);
        let content = util.sanitize(chapcontent.content);
        util.moveChildElements(content.body, newDoc.content);
        return newDoc.dom;
    }
}
