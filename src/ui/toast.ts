export function toast(text: string) { const el = document.createElement("div"); el.className = "toast"; el.textContent = text; document.body.appendChild(el); setTimeout(() => el.remove(), 3000); }
