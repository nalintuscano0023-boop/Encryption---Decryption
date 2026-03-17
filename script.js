

const inputText       = document.getElementById("inputText");
const outputText      = document.getElementById("outputText");
const mode            = document.getElementById("mode");
const method          = document.getElementById("method");
const errorMsg        = document.getElementById("errorMsg");
const copyBtn         = document.getElementById("copyBtn");
const historyList     = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const HISTORY_KEY = "encryption_history";


window.addEventListener("load", loadHistory);


[inputText, mode, method].forEach(el => {
    el.addEventListener("input", processText);
});


copyBtn.addEventListener("click", () => {
    if (!outputText.value) return;
    navigator.clipboard.writeText(outputText.value);
});


clearHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem(HISTORY_KEY);
    historyList.innerHTML = "";
});


const emojiMap = {
    a:"😀", b:"😁", c:"😂", d:"🤣", e:"😃", f:"😄", g:"😅",
    h:"😆", i:"😉", j:"😊", k:"😋", l:"😎", m:"😍",
    n:"😘", o:"😗", p:"😙", q:"😚", r:"🙂", s:"🤗",
    t:"🤩", u:"🤔", v:"🤨", w:"😐", x:"😑", y:"😶", z:"🙄",
    " ":"⬜"
};
const reverseEmojiMap = Object.fromEntries(
    Object.entries(emojiMap).map(([k,v]) => [v,k])
);


const morseMap = {
    a:".-", b:"-...", c:"-.-.", d:"-..", e:".", f:"..-.",
    g:"--.", h:"....", i:"..", j:".---", k:"-.-", l:".-..",
    m:"--", n:"-.", o:"---", p:".--.", q:"--.-", r:".-.",
    s:"...", t:"-", u:"..-", v:"...-", w:".--", x:"-..-",
    y:"-.--", z:"--..",
    0:"-----",1:".----",2:"..---",3:"...--",4:"....-",
    5:".....",6:"-....",7:"--...",8:"---..",9:"----.",
    " ":"/"
};
const reverseMorseMap = Object.fromEntries(
    Object.entries(morseMap).map(([k,v]) => [v,k])
);


function processText() {
    const text = inputText.value.trim();
    const selectedMode = mode.value;
    const selectedMethod = method.value;

    errorMsg.textContent = "";
    outputText.value = "";

    if (text === "") {
        outputText.classList.remove("loading");
        errorMsg.textContent = "⚠️ Input cannot be empty";
        return;
    }

    outputText.classList.add("loading");

    setTimeout(() => {
        try {
            let result = "";

            if (selectedMethod === "base64") {
                result = selectedMode === "encrypt"
                    ? btoa(unescape(encodeURIComponent(text)))
                    : decodeURIComponent(escape(atob(text)));
            }
            else if (selectedMethod === "reverse") {
                result = text.split("").reverse().join("");
            }
            else if (selectedMethod === "emoji") {
                result = selectedMode === "encrypt"
                    ? text.toLowerCase().split("").map(c => emojiMap[c] || c).join("")
                    : text.split("").map(c => reverseEmojiMap[c] || c).join("");
            }
            else if (selectedMethod === "binary") {
                result = selectedMode === "encrypt"
                    ? text.split("").map(c => c.charCodeAt(0).toString(2)).join(" ")
                    : text.split(" ").map(b => String.fromCharCode(parseInt(b, 2))).join("");
            }
            else if (selectedMethod === "morse") {
                result = selectedMode === "encrypt"
                    ? text.toLowerCase().split("").map(c => morseMap[c] || c).join(" ")
                    : text.split(" ").map(c => reverseMorseMap[c] || "").join("");
            }

            outputText.value = result;
            saveToHistory(text, result, selectedMethod, selectedMode);

        } catch {
            errorMsg.textContent = "❌ Invalid encrypted text";
            outputText.value = "";
        } finally {
            outputText.classList.remove("loading");
        }
    }, 600);
}


function saveToHistory(input, output, method, mode) {
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

    history.unshift({
        input,
        output,
        method,
        mode,
        time: new Date().toLocaleTimeString()
    });

    history = history.slice(0, 5); 
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistory(history);
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    renderHistory(history);
}

function renderHistory(history) {
    historyList.innerHTML = "";

    history.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `[${item.mode}] (${item.method}) → ${item.output}`;
        historyList.appendChild(li);
    });
}
