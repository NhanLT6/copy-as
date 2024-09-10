const copyToClipboard = (data) => {
  navigator.clipboard.write(data).then(() => {
    console.log("Copied:", JSON.stringify(data));
  });
};

const copyTextToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    console.log("Copied:", text);
  });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "copy-as-rich-text") {
    const blob = new Blob([message.data], { type: "text/html" });
    const data = [new ClipboardItem({ "text/html": blob })];
    copyToClipboard(data);

    return;
  }

  copyTextToClipboard(message);
});
