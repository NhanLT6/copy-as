const copyTeamsFormat = async (htmlContent) => {
  try {
    // Try simple HTML format first (what Teams expects)
    const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
    const plainBlob = new Blob([htmlContent], { type: 'text/plain' });

    const clipboardItem = new ClipboardItem({
      'text/html': htmlBlob,
      'text/plain': plainBlob,
    });

    await navigator.clipboard.write([clipboardItem]);
  } catch {
    // Fallback to execCommand which works reliably
    await copyTextToClipboard(htmlContent);
  }
};

const copyTextToClipboard = async (text) => {
  // Ensure document is focused for clipboard API
  try {
    window.focus();
    document.body.focus();
  } catch (focusError) {
    // Ignore focus errors
    void focusError;
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Try execCommand fallback
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      document.execCommand('copy');
      document.body.removeChild(textArea);
    } catch (fallbackError) {
      // Silently handle final fallback failure
      void fallbackError;
    }
  }
};

chrome.runtime.onMessage.addListener(async (message) => {
  try {
    if (
      message &&
      typeof message === 'object' &&
      message.action === 'copy-as-rich-text'
    ) {
      if (!message.data) {
        return;
      }

      // Copy HTML as plain text for standard rich text editors
      await copyTextToClipboard(message.data);
      return;
    }

    if (
      message &&
      typeof message === 'object' &&
      message.action === 'copy-as-teams'
    ) {
      if (!message.data) {
        return;
      }

      // Use simplified HTML format for Teams compatibility
      await copyTeamsFormat(message.data);
      return;
    }

    if (typeof message === 'string') {
      await copyTextToClipboard(message);
    }
  } catch (error) {
    // Silently handle errors to avoid console spam
    void error;
  }

  // Always send a response to prevent "The message port closed before a response was received" errors
  return true;
});
