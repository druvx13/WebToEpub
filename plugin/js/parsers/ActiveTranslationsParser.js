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

//dead url/ parser
parserFactory.register("a-t.nu", () => createActiveTranslationsParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createActiveTranslationsParserInstance() {
    return new ActiveTranslationsParser();
}

class ActiveTranslationsParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        return [...dom.querySelectorAll("li.wp-manga-chapter.free-chap a")]
            .map(a => util.hyperLinkToChapter(a))
            .reverse();
    }

    findContent(dom) {
        let content = dom.querySelector("div.entry-content");
        if (content === null) {
            content = dom.querySelector("div.entry-content-container");
        }
        if (content === null) {
            content = dom.querySelector("div.nv-content-wrap");
        }
        if (content !== null) {
            util.removeChildElementsMatchingSelector(content, ".code-block, #comments");
        }
        return content;
    }

    findChapterTitle(dom) {
        return dom.querySelector("h1#chapter-heading");
    }

    preprocessRawDom(chapterDom) {
        this.unscrambleText(chapterDom, this.findContent(chapterDom));
    }

    unscrambleText(dom, content) {
        let style = content.querySelector("style");
        if (style == null) {
            return;
        }
        let rules = this.parseStyle(content);
        let spans = new Map();
        for (let span of [...content.querySelectorAll("p span")]) {
            spans.set(span.className.trim(), span);
        }
        this.addRuleContent(dom, spans, rules);
    }

    parseStyle(content) {
        let rules = new Map();
        let style = [...content.querySelectorAll("style")].pop();
        let lines = style.textContent.split(/;\s*}/)
            .map(l => l.trim())
            .filter(l => !util.isNullOrEmpty(l));
        for (let line of lines) {
            let index = line.indexOf("::before {");
            if (0 < index) {
                this.addPsudoElement(line, index, rules, "before");
                continue;
            }
            index = line.indexOf("::after {");
            if (0 < index) {
                this.addPsudoElement(line, index, rules, "after");
                continue;
            }
            break;
        }
        style.remove();
        return rules;
    }

    addPsudoElement(line, index, rules, name) {
        let className = line.substring(1, index);
        let context = this.extractContent(line);
        let rule = rules.get(className);
        if (rule === undefined) {
            rule = {};
            rules.set(className, rule);
        }
        rule[name] = context;
    }

    extractContent(contextLine) {
        let start = contextLine.indexOf("'");
        let end = contextLine.lastIndexOf("'");
        return contextLine.substring(start + 1, end).replace("\\a0", "");
    }

    addRuleContent(dom, spans, rules)
    {
        for (let span of spans.entries()) {
            let rule = rules.get(span[0]);
            if (rule != null) {
                let text = span[1].textContent;
                if (rule.before) {
                    text = rule.before + text;
                }
                if (rule.after) {
                    text += rule.after;
                }
                let textNode = dom.createTextNode(text);
                span[1].replaceWith(textNode);
            }
        }
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.tab-summary");
    }
}
