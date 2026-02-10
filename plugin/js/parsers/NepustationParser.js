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

parserFactory.register("nepustation.com", () => createNepustationParserInstance());

class CryptEngine {
    constructor() {
        this.decryptTable = new Map();
    }

    buildLookup(cypherText, clearText) {
        for (let i = 0; i < clearText.length; ++i) {
            let cy = cypherText.charAt(i);
            let cl = clearText.charAt(i);
            if (this.decryptTable.get(cy) === undefined) {
                this.decryptTable.set(cy, cl);
            } else if (this.decryptTable.get(cy) !== cl) {
                throw new Error("Invalid conversion");
            }
        }
    }

    decryptString(cypherText) {
        return cypherText.split("").map(c => {
            let t = this.decryptTable.get(c);
            return (t === undefined) ? c : t;
        }).join("");
    }

}

CryptEngine.ALPHABET     = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
CryptEngine.NEPUALPHABET = "ḀḂḄḆḈḊḌḎḐḒḔḖḘḚḜḞḠḢḤḦḨḪḬḮḰḲ"+
                           "ḁḃḅḇḉḋḍḏḑḓḕḗḙḛḝḟḡḣḥḧḩḫḭḯḱḳ";

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createNepustationParserInstance() {
    return new NepustationParser();
}

class NepustationParser extends WordpressBaseParser {
    constructor() {
        super();
        this.cryptEngine = new CryptEngine();
        this.cryptEngine.buildLookup(CryptEngine.NEPUALPHABET, CryptEngine.ALPHABET);       
    }

    customRawDomToContentStep(chapter, content) {
        let walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
        let engine = this.cryptEngine; 
        let node = null;
        while ((node = walker.nextNode())) {
            node.textContent = engine.decryptString(node.textContent);
        }
    }
}
