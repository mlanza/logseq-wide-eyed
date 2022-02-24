# Logseq Wide Eyed Plugin

Toggles the visibility of completed and canceled to-dos.

Toggling is controlled by the eye appearing in the toolbar.  It has opened and closed states which determine the appearance of matching blocks.  This is useful for showing/hiding content such as completed/canceled to-dos, but it can be configured for other purposes.

If any matching content is found on the page or its linked references the eye is underlined.

The opened styling rules are in effect only while hovering over the page body.

See the [Style Carousel Plugin](https://github.com/mlanza/logseq-style-carousel) as it is similar and may better suit your needs.  Read the Design Notes if you're not sure.

## Configurable Settings
* `status` — a preferred initial status of `opened` or `closed`
* `match` — a regular expression string which matches against text content
* `closed` — stylesheet rules applied against matched blocks when the eye is closed
* `opened` — stylesheet rules applied against matched blocks when the eye is opened
* `targets` — what contexts are evaluated?
* `refreshRate` — how often in seconds to check for changes to current page?  0 to disable

## Default Settings
* `status` — "closed"
* `match` — "(^DONE|^CANCELED) "
* `closed` — "display: none;"
* `opened` — "text-decoration: underline wavy;"
* `targets` — ["journals", "page-body", "linked-refs"]
* `refreshRate` — 5

## Design Notes
The primary difference between Wide Eyed and Style Carousel is the manner of content matching.  The former matches directly against block objects as they exist in browser memory while the latter matches against what gets rendered to the DOM.  Because Style Carousel relies purely on CSS selectors, it is simpler and quicker.  But it is also weaker in that it can only match against what can be detected in the DOM with CSS selectors.  In most situations this will be sufficient for your needs.

The block matching approach of Wide Eyed has the potential to be far more powerful than DOM matching, but since the Logseq Plugin api lacks [rendering events](https://discuss.logseq.com/t/add-plugin-rendering-pipeline/5549) it has to work unnecessarily hard to sychronize the UI with whatever blocks flow into a page.  And, in some cases, like the Journals page, certain blocks sneak lazily into the page.  Since Logseq keeps this information to itself, rather than sharing it, the plugin cannot react.  Please vote for [these](https://discuss.logseq.com/t/add-more-event-hooks-subscriptions-for-plugins/5508) [suggestions](https://discuss.logseq.com/t/add-plugin-rendering-pipeline/5549) if you'd like this to be improved.  With more hooks Wide Eyed could do everything Style Carousel does and more, but [without them it's just not possible](https://github.com/mlanza/logseq-style-carousel/issues/1#issuecomment-1049810662).

While both plugins by default toggle TODO visibility, it was never meant to be their sole purpose.  Rather it was meant to offer an example of what's possible.  The purpose is to allow you to configure buttons which conditionally find and style content in whatever manner you dream up.

## Manual installation
* Download this repo
* In Logseq:
  * Ensure Developer Mode is on
  * Open Plugins
  * Select `Load unpacked plugin`

## License
[MIT](./LICENSE.md)

