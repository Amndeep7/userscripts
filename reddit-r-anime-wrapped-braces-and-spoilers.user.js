// ==UserScript==
// @name        Wrapped braces and spoilers on /r/anime
// @namespace   https://asm.works
// @match       https://old.reddit.com/r/anime/*
// @match       https://www.reddit.com/r/anime/*
// @match       https://reddit.com/r/anime/*
// @grant       none
// @version     2.0
// @author      asmLANG
// @description Spoilers are mandated to have braces in front of them.  This script puts those braces in a span and then also wraps the entire spanned braces + spoiler construct with a span.  This enables end users to apply custom css as desired.
// @updateURL   https://raw.githubusercontent.com/Amndeep7/userscripts/main/reddit-r-anime-wrapped-braces-and-spoilers.user.js
// @downloadURL https://raw.githubusercontent.com/Amndeep7/userscripts/main/reddit-r-anime-wrapped-braces-and-spoilers.user.js
// @supportURL  https://github.com/Amndeep7/userscripts/issues
// ==/UserScript==

const replaceSpoilers = () => {
	'use strict';

	// find all the spoilers
	const spoilers = Array.from(document.querySelectorAll('.md-spoiler-text'));

	// process the preceding text to extract the text within brackets so as to place them in a separate span/element from the textnode
	const previousText = Array.from(spoilers.map(s => s.previousSibling));
	const braceSpans = [];
	for(const pt of previousText) {
		const text = pt.data.trimEnd();
		let index = text.length - 1;
		let counter = 0;
		let braceText = "";
		do {
			braceText = text[index] + braceText;
			switch(text[index]) {
				case ']':
					counter += 1;
					break;
				case '[':
					counter -= 1;
					break;
				default:
					break;
			}
			index -= 1;
		} while(counter > 0);

		pt.data = text.slice(0, index + 1); // index is potentally -1 if the entire text is the bracket text

		let span = document.createElement('span');
		span.classList.add('asmworks-spoiler-braces');
		let textNode = document.createTextNode(braceText.slice(1, -1)); // remove the braces
		span.appendChild(textNode);
		braceSpans.push(span);
	}

	// modify the DOM
	for(const [i, s] of spoilers.entries()) {
		s.classList.add('asmworks-spoiler-spoilertext');

		let wrapper = document.createElement('span');
		wrapper.classList.add('asmworks-spoiler-wrapper');

		s.parentNode.insertBefore(wrapper, s);
		wrapper.appendChild(s);

		s.parentNode.insertBefore(braceSpans[i], s);
	}
};

(() => {
	'use strict';

	replaceSpoilers();
})();
