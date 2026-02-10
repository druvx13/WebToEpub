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

parserFactory.registerUrlRule(
    url => (util.extractHostName(url).endsWith(".tumblr.com")),
    () => createTumblrParserInstance()
);

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createTumblrParserInstance() {
    return new TumblrParser();
}

class TumblrParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let menu = this.findContent(dom);
        this.removeUnwantedContent(menu);
        return util.hyperlinksToChapterList(menu);
    }

    findContent(dom) {
        let content = dom.querySelector("main div.post") ||
            dom.querySelector("main div.post-main") ||
            dom.querySelector("article div.post-content");
        //fix embeded image links
        for (let e of content.querySelectorAll("a[data-big-photo]")) {
            e.href = e.dataset?.bigPhoto;
        }
        return content;
    }

    async fetchChapter(url) {
        let dom = (await HttpClient.wrapFetch(url)).responseXML;
        this.removeUnwantedContent(this.findContent(dom));
        let photoset = dom.querySelector("iframe.photoset");
        if (photoset !== null) {
            let iframe = (await HttpClient.wrapFetch(photoset.src)).responseXML;
            let images = iframe.querySelector("div.photoset");
            if (images === null) {
                this.fixupPhotoset(dom);        
            } else {
                photoset.replaceWith(images);
            }
        }
        return dom;
    }

    removeUnwantedContent(content) {
        util.removeChildElementsMatchingSelector(content, "footer, #disqus_thread, #notes");
    }

    fixupPhotoset(dom) {
        let photoset = dom.querySelector("div.html_photoset");
        if (photoset !== null) {
            for (let url of this.getPhotosetUrls(dom)) {
                let img = document.createElement("img");
                img.src = url;
                photoset.appendChild(img);
            }
        }
    }

    getPhotosetUrls(dom) {
        let meta = [...dom.querySelectorAll("meta[property='og:image']")];
        return meta.map(m => m.getAttribute("content"))
            .filter(u => !util.isNullOrEmpty(u));
    }
}
