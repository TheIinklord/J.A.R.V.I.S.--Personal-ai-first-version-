let installPrompt = null;
const installButton = document.getElementById("install-app");
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault(); installPrompt = event; installButton.hidden = false;
});
installButton?.addEventListener("click", async () => {
  if (!installPrompt) return;
  installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; installButton.hidden = true;
});
window.addEventListener("appinstalled", () => { installButton.hidden = true; });
