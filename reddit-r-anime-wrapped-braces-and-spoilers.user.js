// ==UserScript==
// @name        Wrapped braces and spoilers on /r/anime
// @namespace   https://asm.works
// @match       https://old.reddit.com/r/anime/*
// @match       https://www.reddit.com/r/anime/*
// @match       https://reddit.com/r/anime/*
// @grant       none
// @version     3.1
// @author      asmLANG, gyoex
// @description Spoilers are mandated to have braces in front of them.  This script puts those braces in a span and then also wraps the entire spanned braces + spoiler construct with a span.  This enables end users to apply custom css as desired.  NOTICE: A breaking change will happen on the next version update where the URLs for update/download will point to different locations.  Please be ready to either manually modify those URLs or reinstall the userscript.
// @updateURL   https://raw.githubusercontent.com/Amndeep7/userscripts/main/reddit-r-anime-wrapped-braces-and-spoilers.user.js
// @downloadURL https://raw.githubusercontent.com/Amndeep7/userscripts/main/reddit-r-anime-wrapped-braces-and-spoilers.user.js
// @supportURL  https://github.com/Amndeep7/userscripts/issues
// ==/UserScript==

/*
 * All this does is 1) add an additional class to the actual spoiler element (`asmworks-spoiler-spoilertext`), 2) separate out the text within the braces, remove the braces, and put them into their own element (`asmworks-spoiler-braces`), 3) wraps the pair of elements (`asmworks-spoiler-wrapper`), and 4) creates some observers that'll do the above to any additional comments that get loaded in.
 *
 * There will be almost no visible impact from using just this userscript by itself besides the braces being removed from the braced text and that same text now abutting the spoiler.  This is intentional as the purpose of this script is to be a foundation for users to style the official reddit spoilers.
 *
 * Use your favorite userscript add-on on your favorite browser to run this, but I can only guarantee it'll run on an up-to-date Firefox with Violentmonkey as the userscript manager.
 *
 * To style these elements, you will need to use something that can apply CSS to a page.  At least two different add-ons can do this for you: 1) RES/Reddit Enhancement Suite (RES settings console -> Appearance -> Stylesheet Loader -> stick the CSS in a snappet) and 2) Stylus (if you're using this, you probably know well enough how to create a new userstyle and apply it to given pages or how to find out).
 *
 * The CSS in these comments in combination with this userscript will make the official reddit spoilers have similar UX to the old /r/anime style:
 * 1) from /u/Durinthal: https://old.reddit.com/r/anime/comments/q28ulr/announcing_changes_to_spoiler_tags/hfjmy9a/
 * 2) from /u/gyoex: https://old.reddit.com/r/anime/comments/pyw36a/casual_discussion_fridays_week_of_october_01_2021/hfkvjpn/
 * 3) from /u/ZaphodBeebblebrox: https://old.reddit.com/r/anime/comments/pyw36a/casual_discussion_fridays_week_of_october_01_2021/hfmpz8v/
 */

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
	for(const ps of previousSiblings) {
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

