browser.runtime.onInstalled.addListener(() => {
  // Context menu for specific links (e.g. video thumbnails)
  browser.contextMenus.create({
    id: "open-in-mpv-link",
    title: "Open link in MPV",
    contexts: ["link"],
    targetUrlPatterns: [
      "*://*.youtube.com/*",
      "*://youtube.com/*",
      "*://youtu.be/*"
    ]
  });

  // Context menu for the whole page when on YouTube
  browser.contextMenus.create({
    id: "open-in-mpv-page",
    title: "Open page in MPV",
    contexts: ["page"],
    documentUrlPatterns: [
      "*://*.youtube.com/*",
      "*://youtube.com/*",
      "*://youtu.be/*"
    ]
  });

  // Context menu for the tab itself
  browser.contextMenus.create({
    id: "open-in-mpv-tab",
    title: "Open tab in MPV",
    contexts: ["tab"],
    documentUrlPatterns: [
      "*://*.youtube.com/*",
      "*://youtube.com/*",
      "*://youtu.be/*"
    ]
  });
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  let url = "";
  let start = null;

  if (info.menuItemId === "open-in-mpv-link") {
    url = info.linkUrl;
  } else if (info.menuItemId === "open-in-mpv-page") {
    url = info.pageUrl;
  } else if (info.menuItemId === "open-in-mpv-tab") {
    url = tab.url;
  }

  if (url && (info.menuItemId === "open-in-mpv-page" || info.menuItemId === "open-in-mpv-tab") && url.includes("/watch")) {
    if (tab && tab.id) {
      try {
        const results = await browser.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const mainVideo = document.querySelector('.html5-main-video') || document.querySelector('video');
            return mainVideo ? Math.floor(mainVideo.currentTime) : null;
          }
        });
        if (results && results[0] && results[0].result !== null) {
          const time = results[0].result;
          if (time > 0) {
            const h = Math.floor(time / 3600).toString().padStart(2, '0');
            const m = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
            const s = (time % 60).toString().padStart(2, '0');
            start = `${h}:${m}:${s}`;
          }
        }
      } catch (e) {
        console.error("Could not get video time:", e);
      }
    }
  }

  if (url) {
    console.log("Sending URL to MPV native host:", url);
    
    // Instead of sendNativeMessage (which immediately closes the port and kills the Job Object),
    // we use connectNative and deliberately keep the port open so Windows keeps mpv alive.
    let port = browser.runtime.connectNative("youtube_mpv");
    port.postMessage({ url: url, start: start });
    
    port.onMessage.addListener((response) => {
      console.log("Received response from native host:", response);
      // We DO NOT call port.disconnect() here, so that the player process tree is kept alive.
    });
    
    port.onDisconnect.addListener((p) => {
      if (p.error) {
        console.error("Native port disconnected with error:", p.error.message);
      } else {
        console.log("Native port disconnected.");
      }
    });
  }
});
