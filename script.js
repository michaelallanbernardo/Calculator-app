const display = document.getElementById("display");
const buttons = document.querySelectorAll(".buttons button");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const toggleHistoryBtn = document.getElementById("toggleHistoryBtn");
const historyContent = document.querySelector(".history-content");

// Load history from localStorage
function loadHistory() {
    const saved = localStorage.getItem("calcHistory");
    if (saved) {
        const items = JSON.parse(saved);
        items.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            historyList.appendChild(li);
        });
    }
}

// Save history to localStorage
function saveHistory() {
    const items = Array.from(historyList.children).map(li => li.textContent);
    localStorage.setItem("calcHistory", JSON.stringify(items.slice(0, 10)));
}

// Button click handler
buttons.forEach(button => {
    button.addEventListener("click", () => {
        const action = button.getAttribute("data-action");
        const value = button.textContent.trim();

        if (action === "clear") {
            display.value = "";
            playClickSound();
        } else if (action === "delete") {
            display.value = display.value.slice(0, -1);
            playClickSound();
        } else if (action === "equals") {
            calculate();
        } else if (action === "sqrt") {
            try {
                const num = parseFloat(display.value);
                display.value = Math.sqrt(num);
                playSuccessSound();
            } catch (e) {
                display.value = "Error";
                playErrorSound();
            }
        } else if (action === "percent") {
            try {
                const num = parseFloat(display.value);
                display.value = num / 100;
                playSuccessSound();
            } catch (e) {
                display.value = "Error";
                playErrorSound();
            }
        } else if (action === "power") {
            display.value += "**";
            playClickSound();
        } else if (action === "reciprocal") {
            try {
                const num = parseFloat(display.value);
                display.value = 1 / num;
                playSuccessSound();
            } catch (e) {
                display.value = "Error";
                playErrorSound();
            }
        } else if (action === "operator") {
            // Handle operator symbols
            let op = value;
            if (op === "×") op = "*";
            if (op === "−") op = "-";
            display.value += op;
            playClickSound();
        } else {
            display.value += value;
            playClickSound();
        }
    });
});

// Calculate function
function calculate() {
    try {
        const expression = display.value;
        
        // Replace display operators with JS operators
        let jsExpression = expression.replace(/×/g, "*").replace(/−/g, "-").replace(/\*\*/g, "^");
        
        // Convert ^ to Math.pow for calculations
        jsExpression = jsExpression.replace(/\^/g, "**");
        
        const result = Function('"use strict"; return (' + jsExpression + ')')()
        
        // Add to history
        const historyItem = document.createElement("li");
        historyItem.textContent = `${expression} = ${result}`;
        historyList.insertBefore(historyItem, historyList.firstChild);
        
        // Keep only last 10 items
        while (historyList.children.length > 10) {
            historyList.removeChild(historyList.lastChild);
        }
        
        saveHistory();
        display.value = result;
        celebrateResult();
        playSuccessSound();
    } catch (e) {
        display.value = "Error!";
        playErrorSound();
    }
}

// Fun celebrations
function celebrateResult() {
    const equalsBtn = document.querySelector(".btn-equals");
    equalsBtn.style.animation = "none";
    setTimeout(() => {
        equalsBtn.style.animation = "celebrate 0.6s ease";
    }, 10);
    
    createConfetti();
}

// Confetti effect
function createConfetti() {
    const colors = ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#38ef7d", "#4facfe"];
    for (let i = 0; i < 15; i++) {
        const confetti = document.createElement("div");
        confetti.style.position = "fixed";
        confetti.style.width = "10px";
        confetti.style.height = "10px";
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = "50%";
        confetti.style.left = Math.random() * window.innerWidth + "px";
        confetti.style.top = "-10px";
        confetti.style.pointerEvents = "none";
        confetti.style.opacity = "0.8";
        confetti.style.zIndex = "1000";
        confetti.style.boxShadow = "0 0 20px rgba(255,255,255,0.8)";
        document.body.appendChild(confetti);
        
        const duration = 2500 + Math.random() * 1500;
        const xMove = (Math.random() - 0.5) * 300;
        
        confetti.animate([
            {
                transform: "translateY(0) translateX(0) rotate(0deg) scale(1)",
                opacity: "0.9"
            },
            {
                transform: `translateY(${window.innerHeight + 10}px) translateX(${xMove}px) rotate(720deg) scale(0.5)`,
                opacity: "0"
            }
        ], {
            duration: duration,
            easing: "ease-in"
        });
        
        setTimeout(() => confetti.remove(), duration);
    }
}

// Sound effects with improved compatibility
function playClickSound() {
    playBeep(200, 0.08);
}

function playSuccessSound() {
    playBeep(500, 0.12);
    setTimeout(() => playBeep(700, 0.12), 80);
    setTimeout(() => playBeep(900, 0.12), 160);
}

function playErrorSound() {
    playBeep(150, 0.15);
    setTimeout(() => playBeep(100, 0.15), 100);
    setTimeout(() => playBeep(80, 0.15), 200);
}

function playBeep(frequency, duration) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = "sine";
        
        gain.gain.setValueAtTime(0.1, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        // Audio not supported, silently fail
    }
}

// Keyboard support
document.addEventListener("keydown", (e) => {
    const allowed = "0123456789+-*/.";
    
    if (allowed.includes(e.key)) {
        let key = e.key;
        if (key === "*") key = "×";
        if (key === "-") key = "−";
        display.value += key;
        playClickSound();
    }
    
    if (e.key === "Enter") {
        calculate();
    }
    
    if (e.key === "Backspace") {
        display.value = display.value.slice(0, -1);
        playClickSound();
    }
    
    if (e.key === "Escape") {
        display.value = "";
        playClickSound();
    }
});

// Clear history
clearHistoryBtn.addEventListener("click", () => {
    historyList.innerHTML = "";
    localStorage.removeItem("calcHistory");
    playClickSound();
});

// Toggle history panel
toggleHistoryBtn.addEventListener("click", () => {
    historyContent.classList.toggle("collapsed");
    toggleHistoryBtn.classList.toggle("collapsed");
});

// Load saved history on page load
loadHistory();