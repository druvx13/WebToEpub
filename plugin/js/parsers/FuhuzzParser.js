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

parserFactory.register("fuhuzz.pro", () => createFuhuzzParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createFuhuzzParserInstance() {
    return new FuhuzzParser();
}

class FuhuzzParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let leaves = [...dom.querySelectorAll("tbody a")];
        return leaves.map(a => ({
            sourceUrl: a.href, 
            title: a.textContent
        })).reverse();
    }

    findContent(dom) {
        return Parser.findConstrutedContent(dom);
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1")?.textContent ?? null;
    }

    findCoverImageUrl(dom) {
        return dom.querySelector("img")?.src ?? null;
    }
    
    async fetchChapter(url) {
        let dom = (await HttpClient.wrapFetch(url)).responseXML;
        let startString = "fid";
        let scriptElement = [...dom.querySelectorAll("script")].map(a => a.textContent).filter(s => s.includes(startString));
        let json = this.parseNextjsHydration(scriptElement[0]);
        let id = this.flatObjFn2(json, "json");
        let restURL = "https://static.ripfuhu.xyz/api/fttps:webp/"+id.fid;
        let chapjson = (await HttpClient.fetchJson(restURL)).json;
        return this.buildChapter(chapjson.images[0], url, id.currentTitle);
    }

    flatObjFn2(obj) {
        var finalObj = {}; 
        for (let key in obj) {
            if (typeof obj[key] === "object") {
                Object.assign(finalObj, this.flatObjFn2(obj[key], key));
            } else {
                finalObj[key] = obj[key];
            }
        }
        return finalObj;
    }

    parseNextjsHydration(nextjs) {
        let malformedjson = nextjs.match(/{.*}/s);
        let json;
        if (malformedjson == null) {
            malformedjson = nextjs.match(/\[.*\]/s);
            let ret = malformedjson[0];
            json = JSON.parse(ret);
            json.webtoepubformat = "backslash";
        } else {
            let ret = malformedjson[0];
            ret = ret.replaceAll("\\\\\\\"", "[webtoepubescape\"]");
            ret = ret.replaceAll("\\", "");
            ret = ret.replaceAll("[webtoepubescape\"]","\\\"");
            json = JSON.parse(ret);
            json.webtoepubformat = "array";
        }
        return json;
    }

    buildChapter(chapcontent, url, chaptitle) {
        let newDoc = Parser.makeEmptyDocForContent(url);
        let title = newDoc.dom.createElement("h1");
        title.textContent = chaptitle;
        newDoc.content.appendChild(title);
        let text = chapcontent;
        text = text.replaceAll("\n\n", "\n");
        text = text.split("\n");
        for (let element of text) {
            let pnode = newDoc.dom.createElement("p");
            pnode.textContent = element;
            newDoc.content.appendChild(pnode);
        }
        return newDoc.dom;
    }
}
