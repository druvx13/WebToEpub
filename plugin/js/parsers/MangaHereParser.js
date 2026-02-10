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

parserFactory.register("www.mangahere.cc", () => createMangaHereParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createMangaHereParserInstance() {
    return new MangaHereParser();
}

class MangaHereParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        return [...dom.querySelectorAll("div#chapterlist li a")]
            .map(a => util.hyperLinkToChapter(a))
            .reverse();
    }

    findContent(dom) {
        return Parser.findConstrutedContent(dom);
    }

    convertSelectToImgTagsToFollow(dom, content, select) {
        let options = Array.from(select.querySelectorAll("option"));
        for (let option of options.filter(o => !o.value.includes("featured"))) {
            let img = dom.createElement("img");
            img.src = option.value;
            content.appendChild(img);
        }
        
        // first image in list is current page, so replace with image URL 
        // to skip fetching this page again
        let firstImg = this.imageCollector.selectImageUrlFromImagePage(dom);
        content.querySelector("img").src = firstImg;
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.detail-info-cover");
    }

    async fetchChapter(url) {
        // need to open chapter in tab so cookies are loaded
        let tabToClose = await util.createChapterTab(url);
        await util.sleep(5000);
        await MangaHereParser.closeChapterTab(tabToClose);
        let xhr = await HttpClient.wrapFetch(url);
        let newDoc = Parser.makeEmptyDocForContent(url);
        newDoc.dom.base = url;
        let jsonUrls = MangaHereParser.makeImgJsonUrls(url, xhr.responseXML);
        let imgUrls = MangaHereParser.extractImgUrlsFromDom(xhr.responseXML);
        if (jsonUrls.length <= imgUrls.length) {
            MangaHereParser.addImgsToNewDoc(newDoc, imgUrls, new Set());
            return newDoc.dom;
        }
        return MangaHereParser.buildPageWithImageTags(jsonUrls, new Set(), newDoc, "");
    }

    static extractImgUrlsFromDom(dom) {
        let script = [...dom.querySelectorAll("script")]
            .filter(s => s.innerHTML.includes("al(function(p,a,c,k,e,d){"))
            .map(s => s.innerHTML);

        return (script.length === 1)
            ? MangaHereParser.decryptChapterFun(script[0], "")
            : [];
    }

    static closeChapterTab(tabId) {
        return new Promise(function(resolve) {
            chrome.tabs.remove(tabId, () => resolve());
        });
    }

    static async buildPageWithImageTags(jsonUrls, imgUrls, newDoc, err) {

        if (!util.isNullOrEmpty(err)) {
            ErrorLog.log(err);
            return newDoc.dom;
        }
        if (jsonUrls.length <= imgUrls.size) {
            return newDoc.dom;
        }
        let tocUrl = jsonUrls[imgUrls.size];
        let js = await HttpClient.fetchText(tocUrl);
        err = MangaHereParser.responseToImg(newDoc, js, tocUrl, imgUrls);
        return MangaHereParser.buildPageWithImageTags(jsonUrls, imgUrls, newDoc, err);
    }

    static makeImgJsonUrls(url, dom) {
        let script = [...dom.querySelectorAll("script")]
            .filter(MangaHereParser.isWantedScriptElement)
            .map(s => s.innerHTML);

        let chapterId = util.extractSubstring(script[0], MangaHereParser.chatperIdPrefix, ";");
        let imageCount = parseInt(util.extractSubstring(script[0], /var\s*imagecount\s*=\s*/, ";"));

        let index = url.lastIndexOf("/");
        let root = url.substring(0, index + 1);
        let urls = [];
        for (let i = 1; i <= imageCount; ++i) {
            urls.push(`${root}chapterfun.ashx?cid=${chapterId}&page=${i}`);
        }
        return urls;
    }

    static isWantedScriptElement(script) {
        let match = script.innerHTML.match(MangaHereParser.chatperIdPrefix);
        return (match !== null);
    }

    static responseToImg(newDoc, js, tocUrl, imgUrls) {
        if (util.isNullOrEmpty(js)) {
            return `No response for URL ${tocUrl}\r\n`;
        } else {
            let urls = MangaHereParser.decryptChapterFun(js);
            MangaHereParser.addImgsToNewDoc(newDoc, urls, imgUrls);
            return "";
        }
    }

    static addImgsToNewDoc(newDoc, urls, imgUrls) {
        for (let u of urls) {
            if (!imgUrls.has(u)) {
                imgUrls.add(u);
                let img = newDoc.dom.createElement("img");
                img.src = u;
                newDoc.content.appendChild(img);
            }
        }
    }

    static decryptChapterFun(js, prefix) {
        let d = MangaHereParser.extractDataFromjs(js);
        let clearText = MangaHereParser.decrypt(d[0], d[1], d[2], d[3].split("|"));
        return MangaHereParser.extractFilenameFromClearText(clearText, prefix);
    }

    static extractDataFromjs(js) {
        let text = util.extractSubstring(js, "return p;}('" , ".split(");
        text = text.replace(/"/g, "\\\"").replace(/'/g, "\"");
        return JSON.parse("[\"" + text + "]");
    }

    static extractFilenameFromClearText(clearText, prefix) {
        if (prefix === undefined) {
            prefix = util.extractSubstring(clearText, "\"", "\"");
        }
        if (!clearText.includes("[") || !clearText.includes("]")) {
            return [];
        }
        let urls = util.extractSubstring(clearText, "[", "]").split(",");
        return urls.map(u => "http:" + prefix + u.replace(/"/g, ""));
    }

    // extracted from MangaHere (and deobfuscated)
    static decrypt(p, max, len, fragments) {
        let makeKey = function(index) {
            return (index < max ? "" : makeKey(parseInt(index / max))) + ((index = index % max) > 35 ? String.fromCharCode(index + 29) : index.toString(36));
        };
        let replacements = {};
        while (len--)
        {
            let key = makeKey(len);
            replacements[key] = fragments[len] || key;
        }
        let replacerFunction = (key) => replacements[key];
        p = p.replace(new RegExp("\\b\\w+\\b", "g"), replacerFunction);
        return p;        
    }
}

MangaHereParser.chatperIdPrefix = /var\s*chapterid\s*=\s*/;
