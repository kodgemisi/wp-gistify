=== Gistify ===
Contributors: dorukdestan
Tags: syntaxhighlighter, github, gist, code
Requires at least: 4.0.0
Tested up to: 4.3.1
Stable tag: 4.3.1
License: MPL 2.0
License URI: https://www.mozilla.org/en-US/MPL/2.0/

Use Github Gists in your Wordpress posts and pages as code samples.

Create and edit gists from Wordpress editor.

== Description ==
* Use Github Gists in your Wordpress posts and pages as code samples.
* Create and edit gists from Wordpress editor.
* The plugin provides a shortcode, [gistify id=""] so that you can embed any gist to your post.

**The difference of this plugin from other gist plugins** is
that you can also create new gists and edit existing gists from Wordpress' standard editor.

Note that this plugin utilizes gistify jQuery plugin (http://kodgemisi.github.io/gistify/) and
may be thought as a Wordpress wrapper for it.

Also note that MPL 2.0 license is compatible with GPL version 2 or later.
See http://www.gnu.org/licenses/license-list.html#MPL-2.0

== Installation ==
Standard Wordpress plugin installation rules applies. No special requirements.

== Frequently Asked Questions ==

= Why do you need my Github token? =

You can show any gist WITHOUT a token.

We only need Github token for creating gists on behalf of you and update your gists. We don't need
a token to show any gists.

Note that you can create anonymous gist without a token but you won't be able to edit or delete them.

For further details please see: http://kodgemisi.github.io/gistify/token-help.html

= What about my token security? =

We don't see your token. Your token is stored in `localStorage` of your browser.
The `localStorage` is accessable from only your own machine and valid for only your own wordpress domain.

== Screenshots ==
1. Shortcode usage in Wordpress editor
2. Edit gist in Wordpress
3. Result in your rendered post

== Changelog ==
Initial release

== Upgrade Notice ==
Initial release