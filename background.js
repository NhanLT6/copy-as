import {
  getFeatureBranchName,
  getFormattedTitle,
  isJiraTicketPage,
} from './scripts/utils.js';

// Import the String prototype extensions - these are added when utils.js is imported
import './scripts/utils.js';

// Copy as Branch
chrome.contextMenus.create({
  id: 'copy-as-branch',
  title: 'Copy as Branch',
});

// Copy as Title
chrome.contextMenus.create({
  id: 'copy-as-title',
  title: 'Copy as Title',
});

// Copy as Rich text
chrome.contextMenus.create({
  id: 'copy-as-rich-text',
  title: 'Copy as Rich text',
});

// Copy as Markdown
chrome.contextMenus.create({
  id: 'copy-as-markdown',
  title: 'Copy as Markdown',
});

// Copy as Teams
chrome.contextMenus.create({
  id: 'copy-as-teams',
  title: 'Copy as Teams',
});

// Function to send message to tab with error handling and content script injection
async function sendMessageToTab(tabId, message) {
  try {
    // First, try to send the message
    await chrome.tabs.sendMessage(tabId, message);
  } catch {
    // If it fails, try to inject the content script and then send message
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['scripts/content.js'],
    });

    // Wait a bit for the content script to initialize and gain user activation context
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Try sending message again
    await chrome.tabs.sendMessage(tabId, message);
  }
}

// Unified handler function for both context menu and command events
async function handleAction(commandId, tab) {
  try {
    if (!tab?.id || !tab?.title) {
      console.error('Invalid tab information');
      return;
    }

    if (commandId === 'copy-as-branch') {
      // For branch names, use the legacy logic to avoid breaking existing workflows
      const title = isJiraTicketPage(tab.title)
        ? tab.title.removeJiraSuffix().removeSquareBracketsInTicketNum()
        : tab.title;
      const branchName = await getFeatureBranchName(title);
      await sendMessageToTab(tab.id, branchName);
    }

    if (commandId === 'copy-as-title') {
      const formattedTitle = await getFormattedTitle(tab.title);
      await sendMessageToTab(tab.id, formattedTitle);
    }

    if (commandId === 'copy-as-rich-text') {
      const formattedTitle = await getFormattedTitle(tab.title);
      const message = `<a href="${tab.url}">${formattedTitle}</a>`;
      await sendMessageToTab(tab.id, {
        action: 'copy-as-rich-text',
        data: message,
      });
    }

    if (commandId === 'copy-as-markdown') {
      const formattedTitle = await getFormattedTitle(tab.title);
      const markdown = `[${formattedTitle}](${tab.url})`;
      await sendMessageToTab(tab.id, markdown);
    }

    if (commandId === 'copy-as-teams') {
      const formattedTitle = await getFormattedTitle(tab.title);
      const htmlMessage = `<a href="${tab.url}">${formattedTitle}</a>`;
      await sendMessageToTab(tab.id, {
        action: 'copy-as-teams',
        data: htmlMessage,
      });
    }
  } catch (error) {
    // Silently handle errors to avoid console spam
    void error;
  }
}

// Listener for context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    const commandId = info.menuItemId;
    await handleAction(commandId, tab);
  } catch (error) {
    // Silently handle errors to avoid console spam
    void error;
  }
});

// Listener for keyboard command events
chrome.commands.onCommand.addListener(async (commandId) => {
  try {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (activeTab) {
      await handleAction(commandId, activeTab);
    }
  } catch (error) {
    // Silently handle errors to avoid console spam
    void error;
  }
});
