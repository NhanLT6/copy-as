document.addEventListener('DOMContentLoaded', () => {
  // Add event listeners to action buttons
  const actionBtns = document.querySelectorAll('.action-btn');
  actionBtns.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const action = btn.getAttribute('data-action');
      if (action) {
        await copyFromCurrentPage(action);
      }
    });
  });

  // Add event listener to settings button
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', openSettings);
  }
});

// Function to send message to tab with error handling and content script injection
async function sendMessageToTab(tabId, message) {
  try {
    // First, try to send the message
    await chrome.tabs.sendMessage(tabId, message);
  } catch {
    // If it fails, try to inject the content script and then send message
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['scripts/content.js'],
      });

      // Wait a bit for the content script to initialize and gain user activation context
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Try sending message again
      await chrome.tabs.sendMessage(tabId, message);
    } catch {
      // If injection fails, fall back to direct clipboard API
      // Use the popup's clipboard API as fallback
      if (typeof message === 'string') {
        await navigator.clipboard.writeText(message);
      } else if (message?.action === 'copy-as-rich-text' && message?.data) {
        const blob = new Blob([message.data], { type: 'text/html' });
        const clipboardItem = new ClipboardItem({ 'text/html': blob });
        await navigator.clipboard.write([clipboardItem]);
      }
    }
  }
}

// Function to copy from current page - directly use background script logic
async function copyFromCurrentPage(commandId) {
  try {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (activeTab) {
      // Use the same logic as background.js but directly here
      // Import utility functions
      const { getFeatureBranchName, getFormattedTitle, isJiraTicketPage } =
        await import('../scripts/utils.js');

      if (!activeTab.id || !activeTab.title) {
        return;
      }

      if (commandId === 'copy-as-branch') {
        // For branch names, use the legacy logic to avoid breaking existing workflows
        const title = isJiraTicketPage(activeTab.title)
          ? activeTab.title.removeJiraSuffix().removeSquareBracketsInTicketNum()
          : activeTab.title;
        const branchName = await getFeatureBranchName(title);
        await sendMessageToTab(activeTab.id, branchName);
      }

      if (commandId === 'copy-as-title') {
        const formattedTitle = await getFormattedTitle(activeTab.title);
        await sendMessageToTab(activeTab.id, formattedTitle);
      }

      if (commandId === 'copy-as-rich-text') {
        const formattedTitle = await getFormattedTitle(activeTab.title);
        const message = `<a href="${activeTab.url}">${formattedTitle}</a>`;
        await sendMessageToTab(activeTab.id, {
          action: 'copy-as-rich-text',
          data: message,
        });
      }

      if (commandId === 'copy-as-markdown') {
        const formattedTitle = await getFormattedTitle(activeTab.title);
        const markdown = `[${formattedTitle}](${activeTab.url})`;
        await sendMessageToTab(activeTab.id, markdown);
      }

      if (commandId === 'copy-as-teams') {
        const formattedTitle = await getFormattedTitle(activeTab.title);
        const htmlMessage = `<a href="${activeTab.url}">${formattedTitle}</a>`;
        await sendMessageToTab(activeTab.id, {
          action: 'copy-as-teams',
          data: htmlMessage,
        });
      }

      // Close popup after successful copy
      window.close();
    }
  } catch (error) {
    // Silently handle errors to avoid console spam
    void error;
  }
}

// Function to open settings page
function openSettings() {
  chrome.runtime.openOptionsPage();
  window.close();
}
