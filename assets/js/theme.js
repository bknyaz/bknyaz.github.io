(function () {
  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  // 1. Check saved preference
  const saved = localStorage.getItem("theme");

  // 2. Default to dark if no preference saved
  const isDark = saved ? saved === "dark" : true;

  if (isDark) {
    root.classList.add("dark");
    toggle.textContent = "☀️";
  } else {
    toggle.textContent = "🌙";
  }

  // 3. Toggle handler
  toggle.addEventListener("click", () => {
    const nowDark = root.classList.toggle("dark");
    localStorage.setItem("theme", nowDark ? "dark" : "light");
    toggle.textContent = nowDark ? "☀️" : "🌙";
  });
})();
