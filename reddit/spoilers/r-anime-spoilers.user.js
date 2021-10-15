// ==UserScript==
// @name        Wrapped braces and spoilers on /r/anime
// @namespace   https://asm.works
// @match       https://old.reddit.com/r/anime/*
// @match       https://www.reddit.com/r/anime/*
// @match       https://reddit.com/r/anime/*
// @grant       none
// @version     4.1
// @author      asmLANG, gyoex
// @description Spoilers are mandated to have braces in front of them.  This script puts those braces in a span and then also wraps the entire spanned braces + spoiler construct with a span.  This enables end users to apply custom css as desired.
// @updateURL   https://raw.githubusercontent.com/Amndeep7/userscripts/main/reddit/spoilers/r-anime-spoilers.user.js
// @downloadURL https://raw.githubusercontent.com/Amndeep7/userscripts/main/reddit/spoilers/r-anime-spoilers.user.js
// @supportURL  https://github.com/Amndeep7/userscripts/issues
// ==/UserScript==

// For more information, see the README for this script at https://github.com/Amndeep7/userscripts/tree/main/reddit/spoilers/.

const replaceSpoilers = (comment) => {
	'use strict';

	// find all the spoilers
	const spoilers = Array.from(comment.querySelectorAll('.md-spoiler-text'));
	if(spoilers.length === 0) {
		return;
	}

	// process the preceding text and elements so as to extract what is within brackets and place them in a separate span
	const previousSiblings = Array.from(spoilers.map(s => s.previousSibling));
	const braceSpans = [];
	for(const [i, ps] of previousSiblings.entries()) {
		if('classList' in ps && ps.classList.contains('asmworks-spoiler-braces')) {
			braceSpans.push(null);
			continue;
		}

		let span = document.createElement('span');
		span.classList.add('asmworks-spoiler-braces');
		braceSpans.push(span);

		let counter = 0;
		let currentNode = ps;
		let previousSibling = 'previousSibling' in currentNode ? currentNode.previousSibling : null;
		if(currentNode.nodeType !== Node.TEXT_NODE || currentNode.data.trimEnd().slice(-1) !== ']') {
			console.log('Malformed spoiler: does not have braced text');
			braceSpans.pop();
			braceSpans.push(null);
			continue;
		}

		while(currentNode !== null) {
			if(currentNode.nodeType !== Node.TEXT_NODE) {
				span.insertBefore(currentNode, span.firstChild);
			} else {
				const text = currentNode.data.trimEnd();
				let index = text.length - 1;
				let braceText = [];
				do {
					braceText.push(text[index]);
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
				} while(counter > 0 && index >= 0);

				if(index === -1) {
					span.insertBefore(currentNode, span.firstChild);
				} else {
					currentNode.data = text.slice(0, index + 1);
					let textNode = document.createTextNode(braceText.reverse().join(''));
					span.insertBefore(textNode, span.firstChild);
				}
			}

			const tmp = previousSibling !== null && 'previousSibling' in previousSibling ? previousSibling.previousSibling : null;
			currentNode = previousSibling;
			previousSibling = tmp;
			if(counter === 0) {
				break;
			}
		}
		if(counter !== 0) {
			console.log('Malformed spoiler: does not have braced text');
			braceSpans.pop();
			braceSpans.push(null);
			while(span.firstChild !== null) {
				spoilers[i].parentNode.insertBefore(span.firstChild, spoilers[i]);
			}
			continue;
		}

		span.firstChild.data = span.firstChild.data.slice(1); // we've ensured that the first character is an opening bracket so can just remove that
		span.lastChild.data = span.lastChild.data.trimEnd().slice(0, -1); // but if we follow the case of putting the entire node in there, then it's possible there's still whitespace before the closing bracket
	}

	// modify the DOM
	for(const [i, s] of spoilers.entries()) {
		if(braceSpans[i] === null) {
			continue;
		}
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

	document.querySelectorAll('.usertext-body').forEach(replaceSpoilers);

	new MutationObserver(mutations => {
		for (let mutation of mutations) {
			mutation.target.querySelectorAll('.usertext-body').forEach(replaceSpoilers);
		}
	}).observe(document.body, {subtree: true, childList: true});
})();

