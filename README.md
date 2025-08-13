# Facebook play video in background

**Facebook play video in background** is a [Tampermonkey](https://www.tampermonkey.net/) userscript that prevents Facebook from pausing videos when you switch tabs, windows, or lose focus.

## ✨ Features
- Keeps Facebook videos playing even when the tab is inactive
- Spoofs the page visibility API to always appear "visible"
- Blocks all pause-triggering events (`visibilitychange`, `blur`, etc.)
- Restarts videos automatically if something still pauses them

## 📦 Installation
1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser.
2. [Click here to install the script](https://github.com/Leproide/Facebook-play-video-in-background/raw/refs/heads/main/facebook-nopause.user.js).
3. Go to Facebook, start a video, switch tabs — it will keep playing.

## ⚠️ Notes
- Tested on **Chrome**, **Edge**, and **Firefox**.
- May not work on Safari due to WebKit restrictions.
- Other extensions that modify Facebook videos might interfere.

## 📜 License
GPL v2
