# Logseq Wide Eyed Plugin

Toggles the visibility of completed and canceled to-dos.

Toggling is controlled by the eye appearing in the toolbar.  It has opened and closed states which determine the appearance of matching blocks.  This is useful for showing/hiding content such as completed/canceled to-dos, but it can be configured for other purposes.

If any matching content is found on the page or its linked references the eye is underlined.

The opened styling rules are in effect only while hovering over the page body.

## Configurable Settings
* `status` — a preferred initial status of `opened` or `closed`
* `match` — a regular expression string which matches against text content
* `closed` — stylesheet rules applied against matched blocks when the eye is closed
* `opened` — stylesheet rules applied against matched blocks when the eye is opened
* `refreshRate` — how often in seconds to check for changes to current page?  0 to disable

## Default Settings
* `status` — "closed"
* `match` — "(^DONE|^CANCELED) "
* `closed` — "display: none;"
* `opened` — "text-decoration: underline wavy;"
* `refreshRate` — 5

## Design Notes
Had the plugin been designed with the static purpose of toggling TODO visibility some of the implementation details might have been improved, but configurability was the priority.

The Logseq Plugin api lacks [rendering events](https://discuss.logseq.com/t/add-plugin-rendering-pipeline/5549) which would be especially useful on pages, like the journals page, which lazily load content.  For this reason the journal page only matches against entries spanning the next 90 days.  In the absence of rendering events there are limits to what can be efficiently detected and handled.  It handles only a page's main body and linked references.

## Manual installation
* Download this repo
* In Logseq:
  * Ensure Developer Mode is on
  * Open Plugins
  * Select `Load unpacked plugin`

### License
[MIT](./LICENSE.md)

