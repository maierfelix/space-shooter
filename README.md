# Space Shooter

A simple space shooter I hacked together in the past weeks. Don't expect much - no levels, just boom-boom.

Play the demo [here](http://maierfelix.github.io/space-shooter/)<br/>
<a href="http://i.imgur.com/o9TLWKJ.jpg"><img src="http://i.imgur.com/o9TLWKJ.jpg" align="left"/></a><br/>

Controls:

 * Left-Click: Shoot
 * Right-Click: Slow motion
 * Mouse-wheel: Zoom in/out
 * WASD, LURD: Move player

Entities:

 * Pills: Explode when colliding with player ship, chain explosions.
 * Stars: Silver (1 pts), gold (2 pts)
 * Magnets: Attracts stars
 * Shield: Lowered damage for x seconds

Configuration file is [here](https://github.com/maierfelix/space-shooter/blob/master/js/cfg.js).

### Known bugs:
 * Resizing window as well as overlays (disabled right now) results in very slow running code
 * Some positioning (e.g. ship bullets)
 * Entity generation can easily get glitched
 * Changing game scale isn't recommended

### Assets:

 * [Entities](http://kenney.nl/assets/space-shooter-redux)
 * [Particles](https://graphicriver.net/item/special-effects-vol06/12607934)
