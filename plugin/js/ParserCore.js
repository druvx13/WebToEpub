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

/**
 * ParserCore - A functional composition-based parser architecture
 * This replaces the class-based inheritance model with a more flexible
 * configuration and strategy pattern approach.
 */

/**
 * Core parser configuration object structure
 */
class ParserConfig {
    constructor(options = {}) {
        this.hostname = options.hostname || null;
        this.urlMatcher = options.urlMatcher || null;
        this.minimumThrottle = options.minimumThrottle || 500;
        this.maxSimultanousFetchSize = options.maxSimultanousFetchSize || 1;
        
        // Strategy functions
        this.strategies = {
            getChapterUrls: options.getChapterUrls || this.defaultGetChapterUrls,
            findContent: options.findContent || this.defaultFindContent,
            extractTitle: options.extractTitle || this.defaultExtractTitle,
            extractAuthor: options.extractAuthor || this.defaultExtractAuthor,
            extractLanguage: options.extractLanguage || this.defaultExtractLanguage,
            extractSubject: options.extractSubject || this.defaultExtractSubject,
            extractDescription: options.extractDescription || this.defaultExtractDescription,
            findChapterTitle: options.findChapterTitle || this.defaultFindChapterTitle,
            findCoverImageUrl: options.findCoverImageUrl || this.defaultFindCoverImageUrl,
            preprocessRawDom: options.preprocessRawDom || this.defaultPreprocessRawDom,
            removeUnwantedElements: options.removeUnwantedElements || this.defaultRemoveUnwantedElements,
            fetchChapter: options.fetchChapter || this.defaultFetchChapter,
            populateUI: options.populateUI || this.defaultPopulateUI,
            isCustomError: options.isCustomError || this.defaultIsCustomError,
            setCustomErrorResponse: options.setCustomErrorResponse || this.defaultSetCustomErrorResponse
        };
        
        // Additional configuration
        this.imageCollectorFactory = options.imageCollectorFactory || (() => new ImageCollector());
    }
    
    // Default strategy implementations
    defaultGetChapterUrls(dom, chapterUrlsUI) {
        return Promise.resolve([]);
    }
    
    defaultFindContent(dom) {
        return dom.querySelector("article") || dom.querySelector("main");
    }
    
    defaultExtractTitle(dom) {
        return dom.querySelector("h1");
    }
    
    defaultExtractAuthor(dom) {
        return "<unknown>";
    }
    
    defaultExtractLanguage(dom) {
        return "en";
    }
    
    defaultExtractSubject(dom) {
        return "";
    }
    
    defaultExtractDescription(dom) {
        return "";
    }
    
    defaultFindChapterTitle(dom) {
        return null;
    }
    
    defaultFindCoverImageUrl(dom) {
        return null;
    }
    
    defaultPreprocessRawDom(webPageDom) {
        // No-op by default
    }
    
    defaultRemoveUnwantedElements(element) {
        // No-op by default
    }
    
    defaultFetchChapter(url) {
        return HttpClient.wrapFetch(url).then(r => r.responseXML);
    }
    
    defaultPopulateUI() {
        // No-op by default
    }
    
    defaultIsCustomError(response) {
        return false;
    }
    
    defaultSetCustomErrorResponse(url, wrapOptions, checkedresponse) {
        return {};
    }
}

/**
 * Creates a Parser instance from a configuration
 * This acts as an adapter between the new config-based system
 * and the existing Parser class that the rest of the codebase expects
 */
class ConfigBasedParser extends Parser {
    constructor(config) {
        super(config.imageCollectorFactory());
        this.config = config;
        this.minimumThrottle = config.minimumThrottle;
        this.maxSimultanousFetchSize = config.maxSimultanousFetchSize;
    }
    
    async getChapterUrls(dom, chapterUrlsUI) {
        return this.config.strategies.getChapterUrls.call(this, dom, chapterUrlsUI);
    }
    
    findContent(dom) {
        return this.config.strategies.findContent.call(this, dom);
    }
    
    extractTitleImpl(dom) {
        return this.config.strategies.extractTitle.call(this, dom);
    }
    
    extractAuthor(dom) {
        return this.config.strategies.extractAuthor.call(this, dom);
    }
    
    extractLanguage(dom) {
        return this.config.strategies.extractLanguage.call(this, dom);
    }
    
    extractSubject(dom) {
        return this.config.strategies.extractSubject.call(this, dom);
    }
    
    extractDescription(dom) {
        return this.config.strategies.extractDescription.call(this, dom);
    }
    
    findChapterTitle(dom) {
        return this.config.strategies.findChapterTitle.call(this, dom);
    }
    
    findCoverImageUrl(dom) {
        return this.config.strategies.findCoverImageUrl.call(this, dom);
    }
    
    preprocessRawDom(webPageDom) {
        this.config.strategies.preprocessRawDom.call(this, webPageDom);
    }
    
    removeUnwantedElementsFromContentElement(element) {
        this.config.strategies.removeUnwantedElements.call(this, element);
        super.removeUnwantedElementsFromContentElement(element);
    }
    
    async fetchChapter(url) {
        return this.config.strategies.fetchChapter.call(this, url);
    }
    
    populateUIImpl() {
        this.config.strategies.populateUI.call(this);
    }
    
    isCustomError(response) {
        return this.config.strategies.isCustomError.call(this, response);
    }
    
    setCustomErrorResponse(url, wrapOptions, checkedresponse) {
        return this.config.strategies.setCustomErrorResponse.call(this, url, wrapOptions, checkedresponse);
    }
}

/**
 * Factory for creating parsers from configurations
 */
class ParserRegistry {
    constructor() {
        this.configs = new Map();
    }
    
    register(identifier, config) {
        this.configs.set(identifier, config);
    }
    
    createParser(identifier) {
        const config = this.configs.get(identifier);
        if (!config) {
            return null;
        }
        return new ConfigBasedParser(config);
    }
}

// Export for global use
const parserRegistry = new ParserRegistry(); // eslint-disable-line no-unused-vars
