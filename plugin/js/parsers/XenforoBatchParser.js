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
    "Xenforo Batch Post Parser",
    () => createXenforoBatchParserInstance()
);

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createXenforoBatchParserInstance() {
    return new XenforoBatchParser();
}

class XenforoBatchParser extends Parser {
    constructor() {
        super();
        this.cache = new FetchCache();
        this.subParser = null;
    }

    getSubParser(dom)
    {
        if (!this.subParser)
        {
            this.subParser = parserFactory.fetchByUrl(dom.baseURI);
            this.minimumThrottle = this.subParser.minimumThrottle;
        }
        return this.subParser;
    }
    
    // returns promise with the URLs of the chapters to fetch
    // promise is used because may need to fetch the list of URLs from internet
    async getChapterUrls(dom) {
        let pagingUriComponent = "page-";
        let baseURI = null;
        let pageCount = 1;
        {
            let lastPage = dom.querySelector("div.pageNav li:last-child a");
            baseURI = lastPage.baseURI;
            let pageRegexResult = /\d+\/?$/.exec(lastPage.href);
            if (pageRegexResult)
            {
                pageCount = parseInt(pageRegexResult[0]);
            }
            pagingUriComponent = new RegExp(baseURI+"(.*?)\\d+/?$").exec(lastPage.href)[1] ?? pagingUriComponent;
        }
        return [...Array(pageCount).keys()].map(index => ({ 
            sourceUrl: `${baseURI}${pagingUriComponent}${index}`,
            title: `Page ${index + 1}`
        }));
    }
    
    async fetchChapter(url) {
        let fetchedDom = await this.cache.fetch(url);
        let newDoc = Parser.makeEmptyDocForContent(url);
        [... fetchedDom.querySelectorAll("article.message")].forEach(parent => {
            let author = parent.dataset["author"];
            let postIdElement = parent.querySelector("header.message-attribution ul.message-attribution-opposite li:last-child a");
            let title = "";
            
            let chapterBody = parent.querySelector("article.message-body");
            let titleElement = parent.querySelector("span.threadmarkLabel");
            if (titleElement)
            {
                title = titleElement.textContent.trim();
            }
            else
            {
                title = postIdElement.textContent;
                let possibleTitle = chapterBody.querySelector("div.bbWrapper").firstChild.textContent;
                if (possibleTitle.length < 100) //prevent overly-long titles
                {
                    title = `${title}: ${possibleTitle}`;
                }
            }
            title = `${title} — ${author}`;
            titleElement = newDoc.dom.createElement("h1");
            titleElement.textContent = title;
            newDoc.content.appendChild(titleElement);
            util.resolveLazyLoadedImages(chapterBody, "img.lazyload");
            newDoc.content.appendChild(chapterBody);
        });
        return newDoc.dom;
    }

    isLinkToChapter(link) {
        return this.subParser.isLinkToChapter(link);
    }

    findContent(dom) {
        return this.getSubParser(dom).findContent(dom);
    }

    extractTitleImpl(dom) {
        return this.getSubParser(dom).extractTitleImpl(dom);
    }

    extractAuthor(dom) {
        return this.getSubParser(dom).extractAuthor(dom);
    }

    //addTitleToChapter(newDoc, parent) {}

    getInformationEpubItemChildNodes(dom) {
        return this.getSubParser(dom).getInformationEpubItemChildNodes(dom);
    }
}
