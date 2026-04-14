// Elements
const chatToggle = document.getElementById("chatToggle");
const chatWindow = document.getElementById("chatWindow");
const closeChat = document.getElementById("closeChat");
const sendBtn = document.getElementById("sendBtn");
const chatBody = document.getElementById("chatBody");
const userInput = document.getElementById("userInput");

// Function to open chat
function openChat() {
  chatWindow.classList.remove("hidden", "animate-out");
  chatWindow.classList.add("animate-in");

  // Add animated greeting only if chatBody is empty
  if (chatBody.children.length === 0) {
    typeMessage(
      "bot",
      "Hi, I’m your AI Assistant 👋 How may I help you today?"
    );
  }
}

// Function to close chat with animation
function closeChatWindow() {
  chatWindow.classList.remove("animate-in");
  chatWindow.classList.add("animate-out");

  setTimeout(() => {
    chatWindow.classList.add("hidden");
  }, 300);
}

chatToggle.addEventListener("click", () => {
  if (chatWindow.classList.contains("animate-in")) {
    closeChatWindow();
  } else {
    openChat();
  }
});

closeChat.addEventListener("click", closeChatWindow);

document.addEventListener("click", function (event) {
  const clickedInside = chatWindow.contains(event.target);
  const clickedButton = chatToggle.contains(event.target);

  if (!clickedInside && !clickedButton) {
    closeChatWindow();
  }
});

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage("user", text);
  userInput.value = "";

  generateResponse(text);
}

function appendMessage(sender, html) {
  const msg = document.createElement("div");
  msg.classList.add("msg", sender === "user" ? "user-msg" : "bot-msg");

  msg.innerHTML = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["a", "p", "br", "strong", "em", "ul", "ol", "li"],
    ALLOWED_ATTR: ["href", "target", "rel"]
  });

  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function typeMessage(sender, text, delay = 30) {
  const msg = document.createElement("div");
  msg.classList.add("msg", sender === "bot" ? "bot-msg" : "user-msg");
  chatBody.appendChild(msg);

  let i = 0;
  const typing = setInterval(() => {
    msg.textContent += text[i];
    i++;
    chatBody.scrollTop = chatBody.scrollHeight;

    if (i === text.length) clearInterval(typing);
  }, delay);
}

async function generateResponse(question) {
  const loader = document.createElement("div");
  loader.classList.add("loader");
  chatBody.appendChild(loader);
  chatBody.scrollTop = chatBody.scrollHeight;

  try {
    const response = await fetch("https://cms.uisto.edu.ng/api/v1/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: question }),
    });

    const data = await response.json();
    loader.remove();

    // Render HTML safely
    appendMessage(
      "bot",
      data.reply || "<p>I couldn't find an answer. Please contact the school.</p>",
      true
    );

  } catch (error) {
    loader.remove();
    typeMessage("bot", "❌ Unable to connect to the server.");
    console.error("Chat API error:", error);
  }
}

