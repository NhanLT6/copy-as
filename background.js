import {
  getFeatureBranchName,
  isJiraTicketPage,
  toKebabCase,
} from "./scripts/utils.js";

// Copy as Branch
chrome.contextMenus.create({
  id: "copy-as-branch",
  title: "Copy as Branch",
});

// Copy as Commit message
chrome.contextMenus.create({
  id: "copy-as-commit-message",
  title: "Copy as Commit message",
});

// Copy as Rich text
chrome.contextMenus.create({
  id: "copy-as-rich-text",
  title: "Copy as Rich text",
});

// Copy as Markdown
chrome.contextMenus.create({
  id: "copy-as-markdown",
  title: "Copy as Markdown",
});

// Unified handler function for both context menu and command events
async function handleAction(commandId, tab) {
  const title = isJiraTicketPage(tab?.title)
    ? tab?.title.removeJiraSuffix().removeSquareBracketsInTicketNum()
    : tab?.title;

  if (commandId === "copy-as-branch") {
    const branchName = getFeatureBranchName(toKebabCase(title));
    await chrome.tabs.sendMessage(tab?.id, branchName);
  }

  if (commandId === "copy-as-commit-message") {
    await chrome.tabs.sendMessage(tab?.id, title);
  }

  if (commandId === "copy-as-rich-text") {
    const message = `<a href="${tab?.url}">${title}</a>`;
    await chrome.tabs.sendMessage(tab?.id, {
      action: "copy-as-rich-text",
      data: message,
    });
  }

  if (commandId === "copy-as-markdown") {
    const markdown = `[${title}](${tab?.url})`;
    await chrome.tabs.sendMessage(tab?.id, markdown);
  }
}

// Listener for context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const commandId = info.menuItemId;
  await handleAction(commandId, tab);
});

// Listener for keyboard command events
chrome.commands.onCommand.addListener(async (commandId) => {
  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (activeTab) {
    await handleAction(commandId, activeTab);
  }
});
