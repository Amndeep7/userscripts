// ==UserScript==
// // @name        Wrapped braces and spoilers on /r/anime
// // @namespace   https://asm.works
// // @match       https://old.reddit.com/r/anime/*
// // @grant       none
// // @version     1.0
// // @author      asmLANG
// // @description Spoilers are mandated to have braces in front of them.  This script puts those braces in a span and then also wraps the entire spanned braces + spoiler construct with a span.  This enables end users to apply custom css as desired.
// ==/UserScript==

(function() {
	'use strict';

	const spoilers = Array.from(document.querySelectorAll('.md-spoiler-text'));

	const parents = new Map();
	for(const s of spoilers) {
		parents.set(s.parentNode, parents.has(s.parentNode) ? [...parents.get(s.parentNode), s] : [s]);
	}

	for(const [p, allS] of parents) {
		p.innerHTML = p.innerHTML.replaceAll(/\[([\s\S]+?)\]\s?(<span class="md-spoiler-text">)/g, '<span class="asmworks-spoiler-wrapper"><span class="asmworks-spoiler-braces">$1</span>$2');
		for(const s of allS) {
			p.innerHTML = p.innerHTML.replace(s.outerHTML, s.outerHTML + '</span>');
		}
	}  
})();
