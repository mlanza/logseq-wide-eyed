# Logseq Wide Eyed Plugin

Toggles the visibility of completed and canceled to-dos.

Toggling is controlled by the eye appearing in the toolbar.  It has opened and closed states which determine the appearance of matching blocks.  This is useful for showing/hiding content such as completed/canceled to-dos, but it can be configured for other purposes.

If any matching content is found on the page the eye is underlined.

## Configurable Settings
* `status` — a preferred initial status of `opened` or `closed`
* `match` — a regular expression string which matches against text content
* `opened` — stylesheet rules applied against matched blocks when the eye is opened
* `closed` — stylesheet rules applied against matched blocks when the eye is closed
* `refreshRate` — how often in seconds to check for changes to current page?  0 to disable

## Default Settings
* `status` — "closed"
* `match` — "(^DONE|^CANCELED) "
* `opened` — "text-decoration: underline wavy;"
* `closed` — "display: none;"
* `refreshRate` — 5

## Design Notes
Had the plugin been designed with the static purpose of toggling TODO visibility some of the implementation details might have been improved, but configurability was the priority.

The Logseq Plugin api lacks [the features I required](https://discuss.logseq.com/t/add-more-event-hooks-for-plugins/5508) to be made aware of nested content (like linked references) and lazily loaded content (as on the endless journal page).  Thus, the journal page only matches entries spanning the next 90 days.  In the absence of such hooks, not all matches can be detected and handled.  It handles only the main body of pages.

## Manual installation
* Download this repo
* In Logseq:
  * Ensure Developer Mode is on
  * Open Plugins
  * Select `Load unpacked plugin`

### License
[MIT](./LICENSE.md)

