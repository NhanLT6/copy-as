const toKebabCase = (str) => {
  if (!str) return "";

  return str
    .replace(/^\W+|\W+$/g, "") // Replace special chars at the beginning and end
    .replace(/[\W\s]+/g, "-") // Replace spaces with hyphens
    .replace(/([a-z])([A-Z])/g, "$1-$2") // Convert camelCase to kebab-case
    .toLowerCase();
};

const isJiraTicketPage = (url) => url?.endsWith("Jira") || false;

String.prototype.removeJiraSuffix = function () {
  console.log("removeJiraSuffix", this);
  return this.replace(/( - Jira)$/, "");
};

String.prototype.removeSquareBracketsInTicketNum = function () {
  return this.replace(/^(\[)(.*?)(])/, "$2");
};

const getFeatureBranchName = (title) => "feature/" + toKebabCase(title);

export { toKebabCase, isJiraTicketPage, getFeatureBranchName };
