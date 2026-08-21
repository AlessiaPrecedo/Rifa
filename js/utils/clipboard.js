export async function copyTextToClipboard(text) {
  const normalizedText = String(text ?? "");

  if (!normalizedText) {
    throw new Error("No hay texto para copiar");
  }

  const canUseClipboardApi = window.isSecureContext && navigator.clipboard;

  if (canUseClipboardApi) {
    await navigator.clipboard.writeText(normalizedText);
    return;
  }

  const copied = copyWithExecCommand(normalizedText);

  if (!copied) {
    throw new Error("No se pudo copiar al portapapeles");
  }
}

function copyWithExecCommand(text) {
  const tempInput = document.createElement("textarea");
  tempInput.value = text;
  tempInput.setAttribute("readonly", "");
  tempInput.style.position = "fixed";
  tempInput.style.opacity = "0";

  document.body.appendChild(tempInput);
  tempInput.focus();
  tempInput.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(tempInput);

  return copied;
}
