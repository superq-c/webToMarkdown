chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "web-to-markdown-select",
    title: "选择区域复制为 Markdown",
    contexts: ["page"]
  });
  chrome.contextMenus.create({
    id: "web-to-markdown-full",
    title: "整页复制为 Markdown",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "web-to-markdown-select") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    }).then(() => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.__webToMd_startPicker(),
      });
    });
  } else if (info.menuItemId === "web-to-markdown-full") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    }).then(() => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.__webToMd_convertFull(),
      });
    });
  }
});
