const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');
const startContainer = document.getElementById('start-container');
const introScreen = document.getElementById('intro-screen');
const typewriterElement = document.getElementById('typewriter');
const textOverlay = document.getElementById('text-overlay');
const mainContent = document.getElementById('main-content');

const settings = {
    startDate: new Date('2025-04-17T21:00:00'), // ТВОЯ ДАТА
    messages: ["Ты — моя радость","Моя гордость❤️", "Спасибо тебе за всё!", "Я очень сильно тебя люблю❤️❤️","Ты - моя самая самая  лучшая лабубушечка❤️❤️❤️❤️", "С 14 февраля! ❤️"],
    introText: "Сейчас технологии зашли очень далеко. И так как в будущем я планирую стать программистом, я решил сделать валентинку в электронном формате. Надеюсь, тебе очень понравится ❤️",
    particleCount: 2500,
    heartSize: 16,
    jitter: 35,
    ease: 0.03
};

let particles = [];
let heartFormed = false;
let globalOpacity = 1;
let timerInterval;
let animationFrameId;

// Интро
function typeWriter(text, i, fnCallback) {
    if (i < text.length) {
        // Очищаем и вставляем текущую часть текста + HTML-код курсора
        typewriterElement.innerHTML = text.substring(0, i + 1) + '<span class="cursor"></span>';
        
        setTimeout(() => typeWriter(text, i + 1, fnCallback), 50);
    } else {
        // Когда текст закончился, оставляем курсор мигать еще 3 секунды, потом убираем
        setTimeout(() => {
            const cursor = typewriterElement.querySelector('.cursor');
            if (cursor) cursor.remove();
            if (fnCallback) fnCallback();
        }, 3000);
    }
}
window.onload = () => {
    resize();
    typeWriter(settings.introText, 0, () => {
        introScreen.style.opacity = '0';
        setTimeout(() => {
            introScreen.classList.add('hidden-logic');
            startContainer.classList.remove('hidden-logic');
            setTimeout(() => startContainer.classList.add('fade-in'), 100);
        }, 2000);
    });
};

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);

class Particle {
    constructor() {
        this.t = Math.random() * Math.PI * 2;
        const x_base = 16 * Math.pow(Math.sin(this.t), 3);
        const y_base = -(13 * Math.cos(this.t) - 5 * Math.cos(2*this.t) - 2 * Math.cos(3*this.t) - Math.cos(4*this.t));
        this.targetX = x_base * settings.heartSize + (Math.random()-0.5)*settings.jitter;
        this.targetY = y_base * settings.heartSize + (Math.random()-0.5)*settings.jitter;
        this.x = 0; this.y = 0;
        const angle = Math.random() * Math.PI * 2;
        const force = Math.random() * 12;
        this.vx = Math.cos(angle) * force;
        this.vy = Math.sin(angle) * force;
        this.size = Math.random() * 2 + 0.5;
    }
    update() {
        if (!heartFormed) {
            this.x += (this.targetX - this.x) * settings.ease + this.vx;
            this.y += (this.targetY - this.y) * settings.ease + this.vy;
            this.vx *= 0.96; this.vy *= 0.96;
        } else {
            const pulse = Math.sin(Date.now() * 0.0015) * 0.03 + 1;
            this.x += (this.targetX * pulse - this.x) * 0.06;
            this.y += (this.targetY * pulse - this.y) * 0.06;
        }
    }
    draw() {
        ctx.fillStyle = `rgba(255, 0, 85, ${globalOpacity})`;
        ctx.beginPath();
        ctx.arc(this.x + canvas.width/2, this.y + canvas.height/2, this.size, 0, Math.PI*2);
        ctx.fill();
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    animationFrameId = requestAnimationFrame(animate);
}

// Клик по первому сердечку
startContainer.onclick = () => {
    startContainer.style.opacity = '0'; 
    setTimeout(() => {
        startContainer.classList.add('hidden-logic');
        mainContent.classList.add('active');
        particles = []; heartFormed = false; globalOpacity = 1;
        for(let i=0; i<settings.particleCount; i++) particles.push(new Particle());
        if (!animationFrameId) animate();

        setTimeout(() => {
            heartFormed = true;
            canvas.style.transform = 'translateX(-20%)';
            setTimeout(() => {
                textOverlay.classList.remove('hidden');
                setTimeout(() => textOverlay.classList.add('visible'), 50);
                settings.messages.forEach((m, i) => {
                    setTimeout(() => {
                        const div = document.createElement('div');
                        div.className = 'msg';
                        div.textContent = m;
                        document.getElementById('messages-area').appendChild(div);
                        setTimeout(() => div.classList.add('show'), 50);
                    }, i * 2000);
                });
                setTimeout(() => {
                    const b = document.getElementById('show-timer-btn');
                    b.classList.remove('hidden-logic');
                    setTimeout(() => b.classList.add('show'), 100);
                }, settings.messages.length * 2000);
            }, 1500);
        }, 4000);
    }, 1200); // Даем время первой кнопке полностью исчезнуть
};

// Появление таймера
document.getElementById('show-timer-btn').onclick = function() {
    this.classList.remove('show');
    
    // Ждем, пока кнопка полностью исчезнет (800мс)
    setTimeout(() => {
        this.classList.add('hidden-logic');
        const t = document.getElementById('timer');
        t.classList.remove('hidden-logic');
        
        // Пауза перед тем, как текст плавно выплывет снизу
        setTimeout(() => {
            t.classList.add('show'); 
            if (timerInterval) clearInterval(timerInterval);
            timerInterval = setInterval(updateTimerUI, 1000);
            updateTimerUI();
            
            const r = document.getElementById('reset-btn');
            r.classList.remove('hidden-logic');
            setTimeout(() => r.classList.add('show'), 1000);
        }, 300); 
    }, 800); 
};

function updateTimerUI() {
    const t = document.getElementById('timer');
    const diff = new Date() - settings.startDate;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff / 3600000) % 24);
    const m = Math.floor((diff / 60000) % 60);
    const s = Math.floor((diff / 1000) % 60);
    t.innerHTML = `Мы вместе: ${d}д ${h}ч ${m}м ${s}с`;
}

// Плавный сброс
document.getElementById('reset-btn').onclick = function() {
    const fadeDuration = 2000; // Увеличили время затухания до 2 секунд
    const start = Date.now();
    
    // Плавное затухание атомов
    (function fade() {
        const elapsed = Date.now() - start;
        globalOpacity = Math.max(0, 1 - (elapsed / fadeDuration));
        if (globalOpacity > 0) requestAnimationFrame(fade);
    })();
    
    // Плавное растворение всего интерфейса
    textOverlay.classList.remove('visible');
    this.classList.remove('show');
    document.getElementById('timer').classList.remove('show');
    canvas.style.transform = 'translateX(0)';
    
    setTimeout(() => {
        textOverlay.classList.add('hidden');
        mainContent.classList.remove('active');
        document.getElementById('messages-area').innerHTML = '';
        
        const t = document.getElementById('timer');
        t.classList.add('hidden-logic');
        if (timerInterval) clearInterval(timerInterval);

        const b = document.getElementById('show-timer-btn');
        b.classList.remove('show');
        b.classList.add('hidden-logic');
        b.style.display = 'block';

        this.classList.add('hidden-logic');
        particles = [];
        
        // Ждем еще немного в полной темноте перед появлением первого сердца
        setTimeout(() => {
            startContainer.classList.remove('hidden-logic');
            startContainer.style.opacity = '0';
            setTimeout(() => {
                startContainer.style.opacity = '1';
                startContainer.classList.add('fade-in');
            }, 100);
        }, 500);
        
    }, fadeDuration);
};