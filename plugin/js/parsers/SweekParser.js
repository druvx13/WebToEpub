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
parserFactory.register("sweek.com", () => createSweekParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createSweekParserInstance() {
    return new SweekParser();
}

class SweekParser extends Parser {
    constructor() {
        super();
    }

    async getChapterUrls(dom) {
        let firstUrl = this.findReadUrl(dom);
        let split = firstUrl.split("/");
        let device = split.pop();
        let storyId = split.pop();
        let payload = {
            "operationName":null,
            "variables": {"storyId":storyId,"storyDevice":device},
            "query":"query ($storyId: Int!, $storyDevice: String!) {\n  getChapters(storyId: $storyId, storyDevice: $storyDevice) {\n    ok\n    errorCode\n    chapters {\n      id\n      device\n      title\n      __typename\n    }\n    __typename\n  }\n}\n"
        };
        let options = {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(payload)
        };
        let json = (await HttpClient.fetchJson("https://sweek.com/graphql", options)).json;
        let chapters = json.data.getChapters.chapters;
        return chapters.map(c => this.decodeTocJson(firstUrl, c));
    }

    decodeTocJson(firstUrl, json) {
        return ({
            sourceUrl:  firstUrl + "/" + json.id + "/" + json.device,
            title: json.title,
        });
    }

    findReadUrl(dom) {
        let link = dom.querySelector("div.buttonContainer-lMpB3JWLYQC5iY4p4kmh5 a");
        return link.href;
    }

    findContent(dom) {
        return dom.querySelector("div.readingScreenContent-1DcfKpNGB8ryskQn_0vAkM");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h1");
    }

    removeUnwantedElementsFromContentElement(element) {
        util.removeChildElementsMatchingSelector(element, ".actionBar-sVi43NPxX1SfatEP5xyAO");
        super.removeUnwantedElementsFromContentElement(element);
    }

    findCoverImageUrl(dom) {
        let img = dom.querySelector("img[alt='Story cover']");
        return img === null ? null : img.src;
    }

    getInformationEpubItemChildNodes(dom) {
        return [dom.querySelector("p")];
    }
}
