/**
 * Frontend: Client-side Logic
 */

const inputSection = document.getElementById('input-section');
const loadingSection = document.getElementById('loading-section');
const resultSection = document.getElementById('result-section');
const dreamInput = document.getElementById('dream-input');
const submitBtn = document.getElementById('submit-btn');
const retryBtn = document.getElementById('retry-btn');

const interpretationText = document.getElementById('interpretation-text');
const lottoBalls = document.getElementById('lotto-balls');
const luckyItem = document.getElementById('lucky-item');
const luckyColor = document.getElementById('lucky-color');

submitBtn.addEventListener('click', async () => {
    const dream = dreamInput.value.trim();
    
    if (dream.length < 5) {
        alert('꿈의 내용을 조금 더 자세히 적어주세요 (5자 이상).');
        return;
    }

    // Toggle View
    inputSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');

    try {
        const response = await fetch('/api/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dream })
        });

        if (!response.ok) {
            throw new Error('운명 데이터를 가져오는 데 실패했습니다.');
        }

        const data = await response.json();
        renderResult(data);

    } catch (error) {
        alert(error.message);
        resetUI();
    }
});

retryBtn.addEventListener('click', resetUI);

function renderResult(data) {
    loadingSection.classList.add('hidden');
    resultSection.classList.remove('hidden');

    // Interpretation
    interpretationText.innerText = data.interpretation;

    // Lotto Balls
    lottoBalls.innerHTML = '';
    data.lucky_numbers.sort((a, b) => a - b).forEach((num, index) => {
        const ball = document.createElement('div');
        ball.className = `ball ${getBallColorClass(num)}`;
        ball.innerText = num;
        ball.style.animationDelay = `${index * 0.1}s`;
        lottoBalls.appendChild(ball);
    });

    // Luck info
    luckyItem.innerText = data.lucky_item;
    luckyColor.innerText = data.lucky_color;
}

function getBallColorClass(num) {
    if (num <= 10) return 'y1';
    if (num <= 20) return 'y11';
    if (num <= 30) return 'y21';
    if (num <= 40) return 'y31';
    return 'y41';
}

function resetUI() {
    inputSection.classList.remove('hidden');
    loadingSection.classList.add('hidden');
    resultSection.classList.add('hidden');
    dreamInput.value = '';
}