const toKebabCase = (str) => {
  if (!str) return '';

  return str
    .replace(/^\W+|\W+$/g, '') // Replace special chars at the beginning and end
    .replace(/[\W\s]+/g, '-') // Replace spaces with hyphens
    .replace(/([a-z])([A-Z])/g, '$1-$2') // Convert camelCase to kebab-case
    .toLowerCase();
};

const isJiraTicketPage = (url) => url?.endsWith('Jira') || false;

String.prototype.removeJiraSuffix = function () {
  return this.replace(/( - Jira)$/, '');
};

String.prototype.removeSquareBracketsInTicketNum = function () {
  return this.replace(/^(\[)(.*?)(])/, '$2');
};

const getFeatureBranchName = async (title) => {
  const result = await chrome.storage.sync.get(['branchPrefix']);
  const prefix = result.branchPrefix || 'feature/';
  return prefix + toKebabCase(title);
};

const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const getFormattedTitle = async (rawTitle) => {
  const settings = await chrome.storage.sync.get([
    'removePlatformSuffix',
    'removeBrackets',
    'titlePrefix',
  ]);

  let title = rawTitle;

  // Remove platform suffixes (Jira, Azure DevOps, etc.)
  if (settings.removePlatformSuffix !== false) {
    // Default: true
    title = title
      .replace(/( - Jira)$/, '')
      .replace(/( - Azure DevOps)$/, '')
      .replace(/( - GitHub)$/, '')
      .replace(/( - GitLab)$/, '')
      .replace(/( - Linear)$/, '')
      .replace(/( - Asana)$/, '')
      .replace(/( - Trello)$/, '')
      .replace(/( - Monday\.com)$/, '');
  }

  // Remove brackets around ticket numbers
  if (settings.removeBrackets === true) {
    // Default: false
    title = title.replace(/^(\[)(.*?)(])(\s*)/, '$2$4');
  }

  // Add title prefix
  const prefix = settings.titlePrefix || '';
  if (prefix) {
    title = `${prefix} ${title}`;
  }

  return title.trim();
};

export {
  toKebabCase,
  isJiraTicketPage,
  getFeatureBranchName,
  getFormattedTitle,
  escapeHtml,
};
