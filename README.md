# Logseq Wide Eyed Plugin

Toggles the visibility of completed and canceled to-dos.

Toggling is controlled by the eye appearing in the toolbar.  It has opened and closed states which determine the appearance of matching blocks.  This is useful for showing/hiding content such as completed/canceled to-dos, but it can be configured for other purposes.

If any matching content is found on the page or its linked references the eye is underlined.

The opened styling rules are in effect only while hovering over the page body.

[Style Carousel](https://github.com/mlanza/logseq-style-carousel) is more robust and, in many situations, more effective.

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
The primary difference between Wide Eyed and [Style Carousel](https://github.com/mlanza/logseq-style-carousel) is the manner of content matching.
Wide Eyed queries the page as it attempts to find matching blocks, but the main Logseq UI is multifaceted (e.g. Linked References, Unlinked References, embedded queries, some blocks lazily load) and Wide Eyed can neither anticipate nor easily see everything.  Since the Logseq Plugin api does not provide [sufficient hooks](https://discuss.logseq.com/t/add-more-event-hooks-subscriptions-for-plugins/5508) and [rendering events](https://discuss.logseq.com/t/add-plugin-rendering-pipeline/5549) the problem [cannot be easily overcome](https://github.com/mlanza/logseq-style-carousel/issues/1#issuecomment-1049810662).

Style Carousel does not attempt to discern what can be found on the page.  Rather it applies style rules to achieve similar effect.  Furthermore, it can optionally employ queries.  The difference is, when it does, it does not attempt to discern what can be found on the page, but rather builds style rules based on queries against the complete graph.  These style rules, while encompassing a wider scope, are effective in the context of any page.  In most cases, Style Carousel will get you better results.

While both plugins by default toggle TODO visibility, it was never meant as their sole purpose.  Rather it was meant to offer an example of what's possible.  The purpose is to allow you to configure buttons which conditionally find and style content in whatever manner you dream up.

## Manual installation
* Download this repo
* In Logseq:
  * Ensure Developer Mode is on
  * Open Plugins
  * Select `Load unpacked plugin`

## License
[MIT](./LICENSE.md)

