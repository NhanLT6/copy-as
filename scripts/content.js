const copyToClipboard = async (data) => {
  try {
    await navigator.clipboard.write(data);
    console.log('Copied:', JSON.stringify(data));
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }
};

const copyTextToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Copied:', text);
  } catch (error) {
    console.error('Failed to copy text to clipboard:', error);
  }
};

chrome.runtime.onMessage.addListener((message) => {
  try {
    if (
      message &&
      typeof message === 'object' &&
      message.action === 'copy-as-rich-text'
    ) {
      if (!message.data) {
        console.error('No data provided for rich text copy');
        return;
      }
      const blob = new Blob([message.data], { type: 'text/html' });
      const data = [new ClipboardItem({ 'text/html': blob })];
      copyToClipboard(data);
      return;
    }

    if (typeof message === 'string') {
      copyTextToClipboard(message);
    } else {
      console.error('Invalid message format:', message);
    }
  } catch (error) {
    console.error('Error in message handler:', error);
  }
});
