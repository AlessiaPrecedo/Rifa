import { copyTextToClipboard } from "../utils/clipboard.js";

const COPY_ICON_DEFAULT = "\u{1F4CB}";
const COPY_ICON_OK = "\u{2705}";
const COPY_ICON_ERROR = "\u{274C}";
const COPY_FEEDBACK_MS = 2000;
const copyFeedbackTimeouts = new WeakMap();

function updateCopyButton(button, icon) {
  if (button) button.textContent = icon;
}

function restoreOriginalIconWithDelay(button, originalIcon) {
  const activeTimeout = copyFeedbackTimeouts.get(button);
  if (activeTimeout) clearTimeout(activeTimeout);

  const timeoutId = setTimeout(() => {
    updateCopyButton(button, originalIcon);
    copyFeedbackTimeouts.delete(button);
  }, COPY_FEEDBACK_MS);

  copyFeedbackTimeouts.set(button, timeoutId);
}

async function handleCopyClick(event) {
  const button = event.currentTarget;
  const textToCopy = button.dataset.copyText;
  const originalIcon = button.textContent || COPY_ICON_DEFAULT;

  if (!textToCopy) {
    updateCopyButton(button, COPY_ICON_ERROR);
    restoreOriginalIconWithDelay(button, originalIcon);
    return;
  }

  try {
    await copyTextToClipboard(textToCopy);
    updateCopyButton(button, COPY_ICON_OK);
  } catch (error) {
    console.error("Error al copiar:", error);
    updateCopyButton(button, COPY_ICON_ERROR);
  } finally {
    restoreOriginalIconWithDelay(button, originalIcon);
  }
}

export function setupCopyButtons(selector = "[data-copy-text]") {
  const copyButtons = document.querySelectorAll(selector);
  copyButtons.forEach((button) => {
    button.addEventListener("click", handleCopyClick);
  });
}
