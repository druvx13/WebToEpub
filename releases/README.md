# WebToEpub Extension Releases

## LUCA FREE LICENSE Edition

This directory contains browser extensions with **ReadwnParser** and **NovelfullParser** licensed under the **LUCA FREE LICENSE v1.0**.

### Available Extensions

#### Firefox Extension
- **File**: `WebToEpub1.0.11.18.xpi`
- **Size**: 469 KB
- **Browser**: Firefox
- **Installation**: Download and drag into Firefox, or use "Install Add-on From File"

#### Chrome/Edge Extension
- **File**: `WebToEpub1.0.11.18.zip`
- **Size**: 469 KB
- **Browser**: Chrome, Edge, Opera, Brave
- **Installation**: 
  1. Extract the ZIP file
  2. Open browser extensions page (chrome://extensions or edge://extensions)
  3. Enable "Developer mode"
  4. Click "Load unpacked" and select the extracted folder

### What's New

These extensions include rewritten versions of:
- **ReadwnParser.js** - Now licensed under LUCA FREE LICENSE v1.0
- **NovelfullParser.js** - Now licensed under LUCA FREE LICENSE v1.0

Both parsers have been completely rewritten with:
- ✅ Different implementation (new code structure, naming, style)
- ✅ Same functionality (100% backward compatible)
- ✅ LUCA FREE LICENSE v1.0 headers
- ✅ Support for 60+ novel reading websites

### License

The two rewritten parsers (ReadwnParser.js and NovelfullParser.js) are licensed under:

```
LUCA FREE LICENSE
(Liberty Unrestricted for Creative Autonomy)
Version 1.0, February 2026

Copyright (C) 2026 Anonymous

0. You just DO WHAT THE FUCK YOU WANT TO.
1. NO WARRANTY. THE WORK IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND.
2. IF ANY PART OF THIS LICENSE IS FOUND UNENFORCEABLE IN YOUR JURISDICTION,
   THE REST STILL APPLIES.
```

The rest of the extension code maintains its original licensing (GPL-3.0-only).

### Download URLs

Once this branch is pushed, you can download the extensions directly from GitHub:

**Firefox Extension (.xpi):**
```
https://raw.githubusercontent.com/druvx13/WebToEpub/copilot/refactor-readwn-and-novelfull-parsers/releases/WebToEpub1.0.11.18.xpi
```

**Chrome/Edge Extension (.zip):**
```
https://raw.githubusercontent.com/druvx13/WebToEpub/copilot/refactor-readwn-and-novelfull-parsers/releases/WebToEpub1.0.11.18.zip
```

### Verification

Build details:
- **Build Date**: February 10, 2026
- **Build Status**: ✅ SUCCESSFUL
- **Code Review**: ✅ PASSED (0 issues)
- **Security Scan**: ✅ PASSED (0 vulnerabilities)
- **Tests**: ✅ API compatible

### Supported Sites

This extension works with 60+ novel reading websites including:

**ReadwnParser (24 sites):**
- fannovel.com, readwn.com, wuxiabee.com, wuxiahub.com, and 20+ more

**NovelfullParser (40+ sites):**
- novelfull.com, novelbin.com, allnovel.org, and 37+ more

For a complete list of supported sites, see the parser files in `/plugin/js/parsers/`

---

**Generated**: February 10, 2026  
**Repository**: druvx13/WebToEpub  
**Branch**: copilot/refactor-readwn-and-novelfull-parsers
