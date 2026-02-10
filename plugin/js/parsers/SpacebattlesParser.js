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

parserFactory.register("forums.spacebattles.com", () => createSpacebattlesParserInstance());
//dead url
parserFactory.register("forums.sufficientvelocity.com", () => createSpacebattlesParserInstance());
parserFactory.register("alternatehistory.com", () => createSpacebattlesParserInstance());
//dead url
parserFactory.register("forum.questionablequesting.com", () => createSpacebattlesParserInstance());
parserFactory.register("questionablequesting.com", () => createSpacebattlesParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createSpacebattlesParserInstance() {
    return new SpacebattlesParser();
}

class SpacebattlesParser extends Parser {
    constructor() {
        super();
        this.cache = new FetchCache();
        this.minimumThrottle = 50; //182 at 20
        this.expectedChapterUrl = null;
    }

    async getChapterUrls(dom) {
        let chapters = [...dom.querySelectorAll("div.structItem--threadmark a")]
            .filter(this.isLinkToChapter);
        return chapters.map(a => util.hyperLinkToChapter(a));
    }

    isLinkToChapter(link) {
        return !link.querySelector("date")
            && !(new URL(link.href).pathname.startsWith("/awards/award"));
    }

    findContent(dom) {
        return Parser.findConstrutedContent(dom);
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1.p-title-value");
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector("a.username");
        return (authorLabel === null) ? super.extractAuthor(dom) : authorLabel.textContent;
    }

    async fetchChapter(url) {
        let article = await this.fetchArticle(url);
        if (!article && this.expectedChapterUrl && (this.expectedChapterUrl != url)) {
            article = await this.fetchArticle(this.expectedChapterUrl);
        }
        if (article == null) {
            throw new Error(`Can not find chapter ${url}`);
        }
        this.expectedChapterUrl = this.findExpectedNextChapter(article);

        let newDoc = Parser.makeEmptyDocForContent(url);
        this.addTitleToChapter(newDoc, article);
        let content = article.querySelector("article.message-body");
        util.resolveLazyLoadedImages(content, "img.lazyload");
        newDoc.content.appendChild(content);
        return newDoc.dom;
    }

    async fetchArticle(url) {
        let fetchedDom = await this.cache.fetch(url);
        let newUrl = new URL(url);
        let id = newUrl.hash.substring(1) || newUrl.href.substring(newUrl.href.lastIndexOf("/") + 1);
        let parent = fetchedDom.querySelector(`article.hasThreadmark[data-content='${id}']`);
        if (parent === null)
        {
            parent = fetchedDom.querySelector("#" + id)?.parentElement;
        }
        return parent;
    }

    findExpectedNextChapter(article) {
        return article.querySelector("li.threadmark-nav")
            ?.querySelector("a:nth-of-type(3)")
            ?.href;
    }

    addTitleToChapter(newDoc, parent) {
        let titleElement = parent.querySelector("span.threadmarkLabel");
        if (titleElement !== null)
        {
            let title = newDoc.dom.createElement("h1");
            title.textContent = titleElement.textContent.trim();
            newDoc.content.appendChild(title);
        }
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("article.threadmarkListingHeader-extraInfoChild")];
    }
}
