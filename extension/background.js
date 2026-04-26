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

browser.contextMenus.onClicked.addListener((info, tab) => {
  let url = "";

  if (info.menuItemId === "open-in-mpv-link") {
    url = info.linkUrl;
  } else if (info.menuItemId === "open-in-mpv-page") {
    url = info.pageUrl;
  } else if (info.menuItemId === "open-in-mpv-tab") {
    url = tab.url;
  }

  if (url) {
    console.log("Sending URL to MPV native host:", url);
    
    // Instead of sendNativeMessage (which immediately closes the port and kills the Job Object),
    // we use connectNative and deliberately keep the port open so Windows keeps mpv alive.
    let port = browser.runtime.connectNative("youtube_mpv");
    port.postMessage({ url: url });
    
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
