class GeminiTranslator {
  constructor() {
    this.apiKey = localStorage.getItem("gemini_api_key") || "";
    this.initializeElements();
    this.bindEvents();
    this.loadApiKey();
  }

  initializeElements() {
    this.apiKeyInput = document.getElementById("apiKey");
    this.toggleApiKeyBtn = document.getElementById("toggleApiKey");
    this.fromLangSelect = document.getElementById("fromLang");
    this.toLangSelect = document.getElementById("toLang");
    this.inputTextArea = document.getElementById("inputText");
    this.translateBtn = document.getElementById("translateBtn");
    this.swapBtn = document.getElementById("swapLang");
    this.copyBtn = document.getElementById("copyBtn");
    this.resultArea = document.getElementById("resultArea");
    this.translatedText = document.getElementById("translatedText");
    this.loading = document.querySelector(".loading");
  }

  bindEvents() {
    this.apiKeyInput.addEventListener("input", () => this.saveApiKey());
    this.toggleApiKeyBtn.addEventListener("click", () =>
      this.toggleApiKeyVisibility()
    );
    this.translateBtn.addEventListener("click", () => this.translate());
    this.swapBtn.addEventListener("click", () => this.swapLanguages());
    this.copyBtn.addEventListener("click", () => this.copyResult());

    // Enter key to translate
    this.inputTextArea.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        this.translate();
      }
    });
  }

  loadApiKey() {
    this.apiKeyInput.value = this.apiKey;
  }

  saveApiKey() {
    this.apiKey = this.apiKeyInput.value.trim();
    localStorage.setItem("gemini_api_key", this.apiKey);
  }

  toggleApiKeyVisibility() {
    const type = this.apiKeyInput.type === "password" ? "text" : "password";
    this.apiKeyInput.type = type;
    const icon = type === "password" ? "fa-eye" : "fa-eye-slash";
    this.toggleApiKeyBtn.innerHTML = `<i class="fas ${icon}"></i>`;
  }

  swapLanguages() {
    if (this.fromLangSelect.value === "auto") return;

    const fromValue = this.fromLangSelect.value;
    const toValue = this.toLangSelect.value;

    this.fromLangSelect.value = toValue;
    this.toLangSelect.value = fromValue;

    // Swap text content
    const inputText = this.inputTextArea.value;
    const translatedText = this.translatedText.textContent;

    if (translatedText) {
      this.inputTextArea.value = translatedText;
      this.translatedText.textContent = inputText;
    }
  }

  async translate() {
    const text = this.inputTextArea.value.trim();
    const fromLang = this.fromLangSelect.value;
    const toLang = this.toLangSelect.value;

    if (!text) {
      this.showError("Vui lòng nhập văn bản cần dịch");
      return;
    }

    if (!this.apiKey) {
      this.showError("Vui lòng nhập Gemini API Key");
      return;
    }

    this.showLoading(true);
    this.resultArea.style.display = "none";

    try {
      const prompt = this.buildPrompt(text, fromLang, toLang);
      const result = await this.callGeminiApi(prompt);
      this.showResult(result);
    } catch (error) {
      this.showError("Có lỗi xảy ra khi dịch: " + error.message);
    } finally {
      this.showLoading(false);
    }
  }

  buildPrompt(text, fromLang, toLang) {
    const langNames = {
      auto: "tự động phát hiện",
      vi: "Tiếng Việt",
      en: "English",
      zh: "Chinese",
      ja: "Japanese",
      ko: "Korean",
      fr: "French",
      de: "German",
      es: "Spanish",
      ru: "Russian",
      ar: "Arabic",
      th: "Thai",
      hi: "Hindi",
    };

    if (fromLang === "auto") {
      return `Hãy dịch văn bản sau sang ${langNames[toLang]}. Chỉ trả về kết quả dịch, không giải thích gì thêm:\n\n"${text}"`;
    } else {
      return `Hãy dịch văn bản sau từ ${langNames[fromLang]} sang ${langNames[toLang]}. Chỉ trả về kết quả dịch, không giải thích gì thêm:\n\n"${text}"`;
    }
  }

  async callGeminiApi(prompt) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
  }

  showResult(result) {
    this.translatedText.textContent = result;
    this.resultArea.style.display = "block";
    this.resultArea.scrollIntoView({ behavior: "smooth" });
  }

  showError(message) {
    alert(message);
  }

  showLoading(show) {
    this.loading.style.display = show ? "block" : "none";
    this.translateBtn.disabled = show;
  }

  copyResult() {
    navigator.clipboard.writeText(this.translatedText.textContent).then(() => {
      const originalText = this.copyBtn.innerHTML;
      this.copyBtn.innerHTML = '<i class="fas fa-check me-1"></i>Đã sao chép';
      this.copyBtn.classList.remove("btn-outline-primary");
      this.copyBtn.classList.add("btn-success");

      setTimeout(() => {
        this.copyBtn.innerHTML = originalText;
        this.copyBtn.classList.remove("btn-success");
        this.copyBtn.classList.add("btn-outline-primary");
      }, 2000);
    });
  }
}

// Initialize the translator when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new GeminiTranslator();
});
