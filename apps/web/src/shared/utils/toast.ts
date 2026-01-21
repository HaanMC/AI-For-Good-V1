let activeToast: HTMLDivElement | null = null;
let toastTimer: number | null = null;

export const showToast = (message: string, duration: number = 3000) => {
  if (typeof document === "undefined") {
    return;
  }

  if (activeToast) {
    activeToast.remove();
    activeToast = null;
  }

  if (toastTimer) {
    window.clearTimeout(toastTimer);
    toastTimer = null;
  }

  const toast = document.createElement("div");
  toast.textContent = message;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.style.position = "fixed";
  toast.style.bottom = "24px";
  toast.style.right = "24px";
  toast.style.background = "rgba(15, 23, 42, 0.9)";
  toast.style.color = "#fff";
  toast.style.padding = "12px 16px";
  toast.style.borderRadius = "12px";
  toast.style.fontSize = "14px";
  toast.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.25)";
  toast.style.zIndex = "9999";
  toast.style.maxWidth = "320px";
  toast.style.lineHeight = "1.4";
  toast.style.transition = "opacity 0.2s ease";

  document.body.appendChild(toast);
  activeToast = toast;

  toastTimer = window.setTimeout(() => {
    if (!activeToast) {
      return;
    }
    activeToast.style.opacity = "0";
    window.setTimeout(() => {
      activeToast?.remove();
      activeToast = null;
    }, 200);
  }, duration);
};
