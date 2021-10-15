# Wrapped braces and spoilers on /r/anime
Spoilers are mandated to have braces in front of them.  This script puts those braces in a span and then also wraps the entire spanned braces + spoiler construct with a span.  This enables end users to apply custom css as desired.

All this does is 1) add an additional class to the actual spoiler element (`asmworks-spoiler-spoilertext`), 2) separate out the text within the braces, remove the braces, and put them into their own element (`asmworks-spoiler-braces`), 3) wraps the pair of elements (`asmworks-spoiler-wrapper`), and 4) creates some observers that'll do the above to any additional comments that get loaded in.

There will be almost no visible impact from using just this userscript by itself besides the braces being removed from the braced text and that same text now abutting the spoiler.  This is intentional as the purpose of this script is to be a foundation for users to style the official reddit spoilers.

Use your favorite userscript add-on on your favorite browser to run this, but I can only guarantee it'll run on an up-to-date Firefox with Violentmonkey as the userscript manager.

To style these elements, you will need to use something that can apply CSS to a page.  At least two different add-ons can do this for you: 1) RES/Reddit Enhancement Suite (RES settings console -> Appearance -> Stylesheet Loader -> stick the CSS in a snappet) and 2) Stylus (if you're using this, you probably know well enough how to create a new userstyle and apply it to given pages or how to find out).

The CSS in these comments in combination with this userscript will make the official reddit spoilers have similar UX to the old /r/anime style:
1) from /u/Durinthal: https://old.reddit.com/r/anime/comments/q28ulr/announcing_changes_to_spoiler_tags/hfjmy9a/
2) from /u/gyoex: https://old.reddit.com/r/anime/comments/pyw36a/casual_discussion_fridays_week_of_october_01_2021/hfkvjpn/
3) from /u/ZaphodBeebblebrox: https://old.reddit.com/r/anime/comments/pyw36a/casual_discussion_fridays_week_of_october_01_2021/hfmpz8v/

This CSS can also be found in consolidated form [here](r-anime-spoilers.css).
