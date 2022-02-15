# Logseq Wide Eyed Plugin

Toggles the visibility of DONE and CANCELED to-dos.

An eye—appearing in the toolbar—has opened and closed states which can be toggled by clicking it.  Its state determines the appearance of select blocks.  It is useful for showing/hiding content such as completed/canceled to-dos, but it can be configured for other purposes.

It will be underlined if there is any matching content on the page.

The out-of-the-box behavior targets completed/canceled to-dos.  Therefore, to try it out, visit a page having such.

## Configurable Settings
* `status` — a preferred initial status of `opened` or `closed`
* `match` — a regular expression string which matches against text content
* `opened` — stylesheet rules applied against matched blocks when the eye is opened
* `closed` — stylesheet rules applied against matched blocks when the eye is closed

## Design Notes & SDK Limitations
If the plugin was designed with the static purpose of toggling TODO visibility some of the implementation details might have differed, but configurability was prioritized.

Unfortunately, the Logseq SDK lacks the features I required for improving some of the implementation details.  Or, at least, I am not aware of them.

For example:
* When the Journal page loads, to mimimize the overhead of the query it only affects matching blocks appearing on entries spanning the next 90 days.
* When a normal page loads, the initial state of the blocks is taken into consideration.  Any updates made to the page will not be taken into account until you revisit or refresh the page.  This avoids the overhead of polling since the SDK provides no means of tapping into page change events.
* The matching is not applied against linked references.  Again, it would be useful if the SDK provided event hooks for what gets loaded onto a page.

Hopefully, when the plugin api evolves, future improvements can be made.  If you are involved in the Logseq core team, please consider the comments/questions in [index.js](./index.js).

There were workarounds I could have employed but I didn't want the plugin doing too much under the hood.

## Manual installation
* Download this repo
* In Logseq:
  * Ensure Developer Mode is on
  * Open Plugins
  * Select `Load unpacked plugin`

### License
[MIT](./LICENSE.md)

