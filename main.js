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

// UI Content Section (Informational)
const infoSection = document.querySelector('.info-content-section');

submitBtn.addEventListener('click', async () => {
    const dream = dreamInput.value.trim();
    
    if (dream.length < 5) {
        alert('꿈의 내용을 조금 더 자세히 적어주세요 (5자 이상).');
        return;
    }

    // UI state change
    inputSection.classList.add('hidden');
    // We keep the info section visible even during loading for better content density
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
        ball.style.animation = `bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both ${index * 0.1}s`;
        lottoBalls.appendChild(ball);
    });

    // Luck info
    luckyItem.innerText = data.lucky_item;
    luckyColor.innerText = data.lucky_color;

    // Scroll to results
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

// Modal & Legal Documents Logic
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const closeModal = document.getElementById('close-modal');

const docs = {
    privacy: `<h4>개인정보 처리방침</h4><p>1. 수집항목: 입력된 꿈 텍스트<br>2. 수집목적: AI 분석 결과 제공<br>3. 보관기간: 분석 즉시 파기(별도 저장 안 함)</p>`,
    terms: `<h4>이용약관</h4><p>본 서비스는 재미 목적으로 제공되며, 생성된 로또 번호의 당첨을 보장하지 않습니다. 도박 중독에 주의하시기 바랍니다.</p>`
};

document.getElementById('open-privacy').onclick = (e) => {
    e.preventDefault();
    modalTitle.innerText = "개인정보처리방침";
    modalBody.innerHTML = docs.privacy;
    modalOverlay.classList.remove('hidden');
};

document.getElementById('open-terms').onclick = (e) => {
    e.preventDefault();
    modalTitle.innerText = "이용약관";
    modalBody.innerHTML = docs.terms;
    modalOverlay.classList.remove('hidden');
};

closeModal.onclick = () => modalOverlay.classList.add('hidden');