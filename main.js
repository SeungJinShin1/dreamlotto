/**
 * Frontend: Client-side Logic
 */

// 1. DOM Elements Selection
const inputSection = document.getElementById('input-section');
const loadingSection = document.getElementById('loading-section');
const resultSection = document.getElementById('result-section');
const dreamInput = document.getElementById('dream-input');
const submitBtn = document.getElementById('submit-btn');
const retryBtn = document.getElementById('retry-btn');

// 2. Result Step Elements (Fixed Definitions)
const stepInterpretation = document.getElementById('step-interpretation');
const stepNumbers = document.getElementById('step-numbers');
const stepItems = document.getElementById('step-items');

// 3. Data Display Elements
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

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || '운명 데이터를 가져오지 못했습니다.');

        // 단계 2: 데이터 수신 후 결과 렌더링 준비
        prepareResult(data);
        
        // 단계 3: 로딩 숨기고 순차적 노출 시작
        loadingSection.classList.add('hidden');
        resultSection.classList.remove('hidden');

        // 결과가 화면에 잘 보이도록 스크롤 이동
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        await revealSteps();

    } catch (error) {
        alert(error.message);
        resetUI();
    }
});

retryBtn.addEventListener('click', () => {
    resetUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

/**
 * Reset all UI elements to initial state
 */
function resetUI() {
    inputSection.classList.remove('hidden');
    loadingSection.classList.add('hidden');
    resultSection.classList.add('hidden');
    dreamInput.value = '';
    
    // Hide all step cards for next run
    if (stepInterpretation) stepInterpretation.classList.remove('show');
    if (stepNumbers) stepNumbers.classList.remove('show');
    if (stepItems) stepItems.classList.remove('show');
    if (retryBtn) retryBtn.classList.remove('show');
}

/**
 * Fill data and reset reveal classes before showing result
 */
function prepareResult(data) {
    // 텍스트 및 기본 데이터 채우기
    interpretationText.innerText = data.interpretation;
    luckyItem.innerText = data.lucky_item;
    luckyColor.innerText = data.lucky_color;

    // 로또 공 생성 (애니메이션 초기화를 위해 비움)
    lottoBalls.innerHTML = '';
    data.lucky_numbers.sort((a, b) => a - b).forEach((num, index) => {
        const ball = document.createElement('div');
        ball.className = `ball ${getBallColorClass(num)}`;
        ball.innerText = num;
        ball.style.animationDelay = `${index * 0.1}s`;
        lottoBalls.appendChild(ball);
    });

    // 모든 결과 스텝의 show 클래스 제거 (초기화)
    [stepInterpretation, stepNumbers, stepItems, retryBtn].forEach(el => {
        el.classList.remove('show');
    });
}

/**
 * 결과를 단계별로 보여주는 핵심 로직
 */
async function revealSteps() {
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    await delay(100);
    stepInterpretation.classList.add('show');
    
    await delay(800);
    stepNumbers.classList.add('show');
    
    await delay(1200);
    stepItems.classList.add('show');
    
    await delay(800);
    retryBtn.classList.add('show');
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