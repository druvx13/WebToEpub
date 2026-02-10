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

// Register the parser for magic.wizards.com (archive.org is implicit)
parserFactory.register("magic.wizards.com", () => createMagicWizardsParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createMagicWizardsParserInstance() {
    return new MagicWizardsParser();
}

class MagicWizardsParser extends Parser {
    constructor() {
        super();
    }

    // Extract the list of chapter URLs
    async getChapterUrls(dom) {
        let chapterLinks = [];
        chapterLinks = [...dom.querySelectorAll("article a, .article-content a, window.location.hostname, #content article a, #content .article-content a, .articles-listing .article-item a, .articles-bloc .article .details a")];
        // Filter out author links using their URL pattern
        chapterLinks = chapterLinks.filter(link => !this.isAuthorLink(link));
        return chapterLinks.map(this.linkToChapter);
    }

    // Helper function to detect if a link is an author link
    isAuthorLink(link) {
        const href = link.href;
        const authorPattern = /\/archive\?author=/;
        
        // Check if the link matches the author URL pattern or CSS selector
        return authorPattern.test(href);
    }

    // Format chapter links into a standardized structure
    linkToChapter(link) {
        const titleSelectors = [
            "h3",                     // First option: <h3> tag
            ".article-item .title",   // Second option: <p class="title">
            ".details .title"         // Third option: <p class="title" inside .details>
        ];
    
        let titleElement = null;
    
        // Iterate through the selectors and find the first matching element
        for (const selector of titleSelectors) {
            titleElement = link.closest("article")?.querySelector(selector) || 
                        link.closest(".article-item")?.querySelector(selector) || 
                        link.closest(".details")?.querySelector(selector);
            
            if (titleElement) {
                break; // Exit the loop if a title element is found
            }
        }
    
        // Fallback to the link text itself if no titleElement found (this handles simpler cases)
        let title = titleElement ? titleElement.textContent.trim() : link.textContent.trim();
    
        return {
            sourceUrl: link.href,
            title: title
        };
    }

    // Extract the content of the chapter
    findContent(dom) {
        return dom.querySelector("#content article, .article_detail #main-content article, #article-body article, #primary-area section, section article, section, .article_detail #main-content");
    }
   
    // Grab cover image
    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, ".swiper-slide img, article img");
    }


}
