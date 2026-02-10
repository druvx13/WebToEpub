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

parserFactory.register("sto.cx", () => createStocxParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createStocxParserInstance() {
    return new StocxParser();
}

class StocxParser extends Parser {
    constructor() {
        super();
    }

    getChapterUrls(dom) {
        let scripts = StocxParser.findScriptElementWithChapterInfo(dom);
        let chapters = [];
        if (0 < scripts.length) {
            let chapInfo = StocxParser.extractChapterGenInfo(scripts[0]);
            for (let i = 1; i <= chapInfo.maxPage; ++i) {
                chapters.push({
                    sourceUrl: `https://www.sto.cx/book-${chapInfo.bookId}-${i}.html`,
                    title: `${i}`
                });
            }
        }
        return Promise.resolve(chapters);
    }

    static findScriptElementWithChapterInfo(dom) {
        return [...dom.querySelectorAll("script")]
            .filter(s => s.textContent.includes(StocxParser.chapterGenTag))
            .map(s => s.textContent);
    }

    static extractChapterGenInfo(script) {
        let index = script.indexOf(StocxParser.chapterGenTag);
        let split = script.substring(index).split(",");
        return {
            bookId: parseInt(split[1]),
            maxPage: parseInt(split[2]),
        };
    }

    findContent(dom) {
        return dom.querySelector("div#BookContent");
    }

    extractLanguage() {
        return "cn";
    }

    customRawDomToContentStep(chapter, content) {
        let fix = StocxParser.getTextNodesToFixUp(content);
        for (let node of fix) {
            node.nodeValue = StocxParser.fixMangledText(node.nodeValue);
        }
    }

    static getTextNodesToFixUp(content) {
        let n = null; 
        let nodes = [];
        let walk = document.createTreeWalker(content,NodeFilter.SHOW_TEXT,null,false);
        while ((n = walk.nextNode()) !== null) {
            if (n.nodeValue.includes("%")) {
                nodes.push(n);
            }
        }
        return nodes;
    }

    static fixMangledText(text) {
        let bytes = [];
        let i = 0;
        while (i < text.length) {
            if (StocxParser.isEncodeddByte(text, i)) {
                bytes.push(StocxParser.decodeByte(text, i));
                i += 3;
            } else {
                let utf = StocxParser.getUtf8encoder().encode(text[i]);
                for (let u of utf) {
                    bytes.push(u);
                }
                ++i;
            }
        }
        return StocxParser.getUtf8decoder().decode(new Uint8Array(bytes));
    }

    static isEncodeddByte(text, index) {
        return (index + 2 < text.length)
            && (text[index] === "%")
            && (StocxParser.isHexChar(text[index + 1]))
            && (StocxParser.isHexChar(text[index + 2]));
    }

    static isHexChar(char) {
        return !isNaN(parseInt(char[0], 16));
    }

    static decodeByte(text, index) {
        return parseInt(text.substring(index + 1, index + 3), 16);
    }

    static getUtf8decoder() {
        if (StocxParser.utf8decoder === undefined) {
            StocxParser.utf8decoder = new TextDecoder("utf-8");
        }
        return StocxParser.utf8decoder;
    }

    static getUtf8encoder() {
        if (StocxParser.utf8encoder === undefined) {
            StocxParser.utf8encoder = new TextEncoder();
        }
        return StocxParser.utf8encoder;
    }

    findChapterTitle(dom) {
        return dom.querySelector("h1");
    }
}

StocxParser.chapterGenTag = "ANP_goToPage(";
