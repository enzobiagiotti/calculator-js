const screen = document.getElementById("screen");
const historyEl = document.getElementById("history");
const themeToggle = document.getElementById("themeToggle");

let expr = "";          // expressão atual
let lastResult = null;  // último resultado (para histórico)

function render() {
  screen.textContent = expr || "0";
  historyEl.textContent = lastResult !== null ? `Resultado: ${lastResult}` : "";
}

// sanitiza e avalia com segurança básica (sem eval direto em input livre)
function safeEval(expression) {
  // permite apenas números, operadores básicos, ponto e parênteses (sem letras)
  if (!/^[0-9+\-*/%.() ]+$/.test(expression)) return null;

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(`"use strict"; return (${expression});`);
    const result = fn();
    if (!Number.isFinite(result)) return null;
    return result;
  } catch {
    return null;
  }
}

function appendValue(val) {
  // evita dois operadores seguidos (exceto - para negativos pode ser tratado depois)
  const ops = ["+", "-", "*", "/", "%"];
  const last = expr.slice(-1);

  if (ops.includes(val)) {
    if (expr === "" && val !== "-") return; // não começa com operador (exceto -)
    if (ops.includes(last)) {
      expr = expr.slice(0, -1) + val; // troca operador
      render();
      return;
    }
  }

  // evita múltiplos pontos no mesmo número
  if (val === ".") {
    const parts = expr.split(/[\+\-\*\/%]/);
    const current = parts[parts.length - 1];
    if (current.includes(".")) return;
    if (current === "") expr += "0";
  }

  expr += val;
  render();
}

function clearAll() {
  expr = "";
  render();
}

function backspace() {
  expr = expr.slice(0, -1);
  render();
}

function equals() {
  const result = safeEval(expr);
  if (result === null) {
    screen.textContent = "Erro";
    return;
  }
  lastResult = result;
  expr = String(result);
  render();
}

// Clique nos botões
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const action = btn.dataset.action;
  const value = btn.dataset.value;

  if (action === "clear") return clearAll();
  if (action === "backspace") return backspace();
  if (action === "equals") return equals();
  if (value) return appendValue(value);
});

// Teclado
document.addEventListener("keydown", (e) => {
  const key = e.key;

  if ((key >= "0" && key <= "9") || ["+", "-", "*", "/", "%", ".", "(", ")"].includes(key)) {
    appendValue(key);
  } else if (key === "Enter") {
    e.preventDefault();
    equals();
  } else if (key === "Backspace") {
    backspace();
  } else if (key === "Escape") {
    clearAll();
  }
});

// Tema
function applyThemeFromStorage() {
  const saved = localStorage.getItem("theme");
  if (saved === "light") document.documentElement.classList.add("light");
}
applyThemeFromStorage();

themeToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("light");
  localStorage.setItem("theme", document.documentElement.classList.contains("light") ? "light" : "dark");
});

render();
