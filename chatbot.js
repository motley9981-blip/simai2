// ===========================
// Chatbot Logic
// ===========================
let isChatOpen = false;
let apiKey = localStorage.getItem('openai_api_key') || '';

function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    const apiKeyConfig = document.getElementById('apiKeyConfig');
    isChatOpen = !isChatOpen;

    if (isChatOpen) {
        chatWindow.classList.add('active');
        // Focus input
        setTimeout(() => document.getElementById('chatInput').focus(), 300);

        // Show API key config if not set
        if (!apiKey) {
            apiKeyConfig.style.display = 'flex';
        } else {
            apiKeyConfig.style.display = 'none';
        }
    } else {
        chatWindow.classList.remove('active');
    }
}

function saveApiKey() {
    const input = document.getElementById('apiKeyInput');
    const key = input.value.trim();

    if (key.startsWith('sk-')) {
        apiKey = key;
        localStorage.setItem('openai_api_key', apiKey);
        document.getElementById('apiKeyConfig').style.display = 'none';
        addBotMessage('API Key가 저장되었습니다. 이제 대화를 시작해보세요!');
    } else {
        alert('올바른 OpenAI API Key를 입력해주세요 (sk-로 시작).');
    }
}

function handleChatInput(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    // Add user message
    addUserMessage(message);
    input.value = '';

    // Check API Key
    if (!apiKey) {
        setTimeout(() => {
            addBotMessage('OpenAI API Key가 필요합니다. 상단 입력창에 키를 입력해주세요.');
            document.getElementById('apiKeyConfig').style.display = 'flex';
        }, 500);
        return;
    }

    // Show loading
    const loadingId = addLoadingIndicator();

    try {
        const response = await callOpenAI(message);
        removeLoadingIndicator(loadingId);
        addBotMessage(response);
    } catch (error) {
        removeLoadingIndicator(loadingId);
        addBotMessage('죄송합니다. 오류가 발생했습니다: ' + error.message);
    }
}

function addUserMessage(text) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function addBotMessage(text) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function addLoadingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message';
    loadingDiv.id = 'loading-' + Date.now();
    loadingDiv.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    chatMessages.appendChild(loadingDiv);
    scrollToBottom();
    return loadingDiv.id;
}

function removeLoadingIndicator(id) {
    const element = document.getElementById(id);
    if (element) element.remove();
}

function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function callOpenAI(userMessage) {
    const API_URL = 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "당신은 'La Maison'이라는 프렌치 레스토랑의 친절한 AI 어시스턴트입니다. 메뉴 추천, 예약 안내, 위치 안내 등을 도와줍니다. 답변은 한국어로 정중하게 해주세요."
                },
                {
                    role: "user",
                    content: userMessage
                }
            ],
            max_tokens: 150
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API 호출 실패');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}
