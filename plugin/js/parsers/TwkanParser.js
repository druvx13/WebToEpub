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

parserFactory.register("twkan.com", () => createTwkanParserInstance());

/**
 * Refactored using functional composition pattern
 * Original: class-based inheritance
 * New: factory function with method composition
 */
function createTwkanParserInstance() {
    return new TwkanParser();
}

class TwkanParser extends Parser {
    constructor() {
        super();
        // Add delay between requests to avoid rate limiting
        this.minimumThrottle = 1000;
    }

    async getChapterUrls(dom) {
        // Extract book ID from the current URL
        let bookId = this.extractBookId(dom.baseURI);
        if (!bookId) {
            // Fallback: try to get from meta tag
            let metaBookId = dom.querySelector("meta[property='og:book_id']");
            if (metaBookId) {
                bookId = metaBookId.getAttribute("content");
            }
        }
        
        if (!bookId) {
            throw new Error("Could not extract book ID from URL");
        }

        // Fetch the FULL chapter list directly from the AJAX endpoint
        // This bypasses the "Load More" button entirely
        let ajaxUrl = `https://twkan.com/ajax_novels/chapterlist/${bookId}.html`;
        let response = await HttpClient.wrapFetch(ajaxUrl);
        let chapterListDom = response.responseXML;
        
        // The AJAX response contains <ul><li><a href="...">Chapter Title</a></li>...</ul>
        // Get all chapter links from the response
        let links = [...chapterListDom.querySelectorAll("ul li a")]
            .filter(a => a.href.includes("/txt/"));
        
        return links.map(a => util.hyperLinkToChapter(a));
    }

    findContent(dom) {
        // User provided: #txtcontent0
        return dom.querySelector("#txtcontent0");
    }

    extractTitleImpl(dom) {
        // From main book page: .booknav2 h1 a or h1 a
        let titleEl = dom.querySelector(".booknav2 h1 a, .booknav2 h1, h1 a");
        if (titleEl) {
            return titleEl.textContent.trim();
        }
        // Fallback: try meta tag
        let metaTitle = dom.querySelector("meta[property='og:title']");
        if (metaTitle) {
            return metaTitle.getAttribute("content");
        }
        return dom.querySelector("h1");
    }

    extractAuthor(dom) {
        // From main book page: .booknav2 p contains "作者：" followed by author link
        let authorEl = dom.querySelector(".booknav2 p a[href*='/author/']");
        if (authorEl) {
            return authorEl.textContent.trim();
        }
        // Fallback: try meta tag
        let metaAuthor = dom.querySelector("meta[property='og:novel:author']");
        if (metaAuthor) {
            return metaAuthor.getAttribute("content");
        }
        return super.extractAuthor(dom);
    }

    extractLanguage() {
        return "zh";
    }

    extractSubject(dom) {
        // Get category/genre from meta tag or page
        let metaCategory = dom.querySelector("meta[property='og:novel:category']");
        if (metaCategory) {
            return metaCategory.getAttribute("content");
        }
        let categoryEl = dom.querySelector(".booknav2 p a[href*='/class/']");
        return categoryEl?.textContent?.trim() ?? "";
    }

    extractDescription(dom) {
        // Get description from meta tag or page
        let metaDesc = dom.querySelector("meta[property='og:description']");
        if (metaDesc) {
            return metaDesc.getAttribute("content");
        }
        let descEl = dom.querySelector(".navtxt p");
        return descEl?.textContent?.trim() ?? "";
    }

    findChapterTitle(dom) {
        // User provided: #container > div.mybox > div.txtnav > h1
        // Also try simpler selectors
        return dom.querySelector(".txtnav h1, #container .txtnav h1, h1");
    }

    findCoverImageUrl(dom) {
        // First try the og:image meta tag (most reliable)
        let metaImage = dom.querySelector("meta[property='og:image']");
        if (metaImage) {
            return metaImage.getAttribute("content");
        }
        
        // Try to find cover image in page
        let coverImg = dom.querySelector(".bookimg2 img, .bookimg img");
        if (coverImg) {
            return coverImg.src;
        }
        
        // Fallback: construct URL from book ID
        // Pattern: https://twkan.com/files/article/image/76/76222/76222s.jpg
        let bookId = this.extractBookId(dom.baseURI);
        if (bookId) {
            let prefix = bookId.substring(0, 2);
            return `https://twkan.com/files/article/image/${prefix}/${bookId}/${bookId}s.jpg`;
        }
        
        return null;
    }

    extractBookId(url) {
        // Extract book ID from URL like:
        // https://twkan.com/book/76222.html
        // https://twkan.com/book/76222/index.html
        // https://twkan.com/txt/76222/46362641
        let match = url.match(/\/(?:book|txt)\/(\d+)/);
        return match ? match[1] : null;
    }

    removeUnwantedElementsFromContentElement(element) {
        // Remove common unwanted elements
        util.removeChildElementsMatchingSelector(element, 
            "script, .ads, .ad, .advertisement, #ad, .social-share, .share-buttons, " +
            ".txtcenter, .adsbygoogle, ins.adsbygoogle"
        );
        super.removeUnwantedElementsFromContentElement(element);
    }

    // Note: getInformationEpubItemChildNodes intentionally not defined
    // to skip info page (DOMPurify not available in this extension build)
}
