document.addEventListener('DOMContentLoaded', async () => {
  // Import utility functions
  const { toKebabCase, escapeHtml } = await import('./scripts/utils.js');

  const branchPrefixInput = document.getElementById('branchPrefix');
  const previewGrid = document.getElementById('previewGrid');
  const removePlatformSuffixCheckbox = document.getElementById(
    'removePlatformSuffix'
  );
  const removeBracketsCheckbox = document.getElementById('removeBrackets');
  const titlePrefixInput = document.getElementById('titlePrefix');
  const saveButton = document.getElementById('saveButton');

  // Load saved settings
  const result = await chrome.storage.sync.get([
    'branchPrefix',
    'removePlatformSuffix',
    'removeBrackets',
    'titlePrefix',
  ]);

  // Set branch prefix
  const savedPrefix = result.branchPrefix || 'feature/';
  branchPrefixInput.value = savedPrefix;

  // Set title formatting options
  removePlatformSuffixCheckbox.checked = result.removePlatformSuffix !== false; // Default: true
  removeBracketsCheckbox.checked = result.removeBrackets === true; // Default: false
  titlePrefixInput.value = result.titlePrefix || '';

  updatePreview();

  // Update preview when any input changes
  branchPrefixInput.addEventListener('input', updatePreview);
  removePlatformSuffixCheckbox.addEventListener('change', updatePreview);
  removeBracketsCheckbox.addEventListener('change', updatePreview);
  titlePrefixInput.addEventListener('input', updatePreview);

  // Save settings
  saveButton.addEventListener('click', async () => {
    const settings = {
      branchPrefix: branchPrefixInput.value.trim(),
      removePlatformSuffix: removePlatformSuffixCheckbox.checked,
      removeBrackets: removeBracketsCheckbox.checked,
      titlePrefix: titlePrefixInput.value.trim(),
    };

    try {
      saveButton.disabled = true;
      saveButton.textContent = 'Saving...';

      await chrome.storage.sync.set(settings);

      // Show success feedback on button
      saveButton.textContent = 'Saved Successfully!';
      saveButton.style.backgroundColor = '#4caf50';
      saveButton.style.borderColor = '#4caf50';
      saveButton.style.color = 'white';

      // Reset button after delay
      setTimeout(() => {
        saveButton.disabled = false;
        saveButton.textContent = 'Save Settings';
        saveButton.style.backgroundColor = '';
        saveButton.style.borderColor = '';
        saveButton.style.color = '';
      }, 2000);
    } catch {
      saveButton.disabled = false;
      saveButton.textContent = 'Save Settings';
      saveButton.style.backgroundColor = '#f44336';
      saveButton.style.borderColor = '#f44336';
      saveButton.style.color = 'white';

      setTimeout(() => {
        saveButton.style.backgroundColor = '';
        saveButton.style.borderColor = '';
        saveButton.style.color = '';
      }, 2000);
    }
  });

  function updatePreview() {
    const exampleUrl = 'https://company.atlassian.net/browse/PROJ-123';
    const exampleRawTitle =
      '[PROJ-123] Fix user authentication timeout issue - Jira';

    // Process the title based on current settings
    let processedTitle = exampleRawTitle;

    // Apply platform suffix removal
    if (removePlatformSuffixCheckbox.checked) {
      processedTitle = processedTitle.replace(/( - Jira)$/, '');
    }

    // Apply bracket removal
    if (removeBracketsCheckbox.checked) {
      processedTitle = processedTitle.replace(/^(\[)(.*?)(])(\s*)/, '$2$4');
    }

    // Add title prefix
    const titlePrefix = titlePrefixInput.value.trim();
    if (titlePrefix) {
      processedTitle = `${titlePrefix} ${processedTitle}`;
    }

    // Generate branch name
    const branchPrefix = branchPrefixInput.value.trim() || 'feature/';
    const branchTitle = exampleRawTitle
      .replace(/( - Jira)$/, '')
      .replace(/^(\[)(.*?)(])(\s*)/, '$2$4');
    const branchName = branchPrefix + toKebabCase(branchTitle);

    // Create preview HTML with enhanced styling
    previewGrid.innerHTML = `
      <div class="preview-item">
        <div class="preview-label">Copy as Branch</div>
        <div class="preview-content">${escapeHtml(branchName)}</div>
      </div>
      <div class="preview-item">
        <div class="preview-label">Copy as Title</div>
        <div class="preview-content">${escapeHtml(processedTitle.trim())}</div>
      </div>
      <div class="preview-item">
        <div class="preview-label">Copy as Rich Text</div>
        <div class="preview-content">&lt;a href="${escapeHtml(exampleUrl)}"&gt;${escapeHtml(processedTitle.trim())}&lt;/a&gt;</div>
      </div>
      <div class="preview-item">
        <div class="preview-label">Copy as Markdown</div>
        <div class="preview-content">[${escapeHtml(processedTitle.trim())}](${escapeHtml(exampleUrl)})</div>
      </div>
    `;
  }
});
