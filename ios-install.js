(() => {
  const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const dismissed = sessionStorage.getItem("ios-install-dismissed") === "1";
  const panel = document.getElementById("ios-install");
  if (panel && ios && !standalone && !dismissed) panel.hidden = false;
  document.getElementById("ios-install-close")?.addEventListener("click", () => {
    panel.hidden = true;
    sessionStorage.setItem("ios-install-dismissed", "1");
  });
})();
