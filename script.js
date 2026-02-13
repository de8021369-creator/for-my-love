const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');
const startContainer = document.getElementById('start-container');
const introScreen = document.getElementById('intro-screen');
const typewriterElement = document.getElementById('typewriter');
const textOverlay = document.getElementById('text-overlay');
const mainContent = document.getElementById('main-content');
const typeSound = document.getElementById('type-sound');
const overlayStart = document.getElementById('overlay-start');

const settings = {
    startDate: new Date('2025-04-17T21:00:00'), //
    messages: ["Ты — моя радость","Моя гордость❤️", "Спасибо тебе за всё!", "Я очень сильно тебя люблю❤️❤️","Ты - моя самая самая лучшая лабубушечка❤️❤️❤️❤️", "С 14 февраля! ❤️"], //
    introText: "Сейчас технологии зашли очень далеко. И так как в будущем я планирую стать программистом, я решил сделать валентинку в электронном формате. Надеюсь, что тебе очень понравится ❤️", //
    particleCount: 2500, //
    heartSize: 16, //
    jitter: 45, // Увеличили разброс для "пушистости" как на первом фото
    ease: 0.03 //
};

let particles = [];
let heartFormed = false;
let globalOpacity = 1;
let timerInterval;
let animationFrameId;

function typeWriter(text, i, fnCallback) {
    if (i < text.length) {
        if (typeSound) {
            const sound = typeSound.cloneNode();
            sound.volume = 0.4;
            sound.play().catch(e => console.log("Ошибка звука:", e));
            setTimeout(() => { sound.pause(); sound.remove(); }, 300);
        }
        typewriterElement.innerHTML = text.substring(0, i + 1) + '<span class="cursor"></span>';
        const speed = Math.floor(Math.random() * (150 - 80) + 80);
        setTimeout(() => typeWriter(text, i + 1, fnCallback), speed);
    } else {
        setTimeout(() => {
            const cursor = typewriterElement.querySelector('.cursor');
            if (cursor) cursor.remove();
            if (fnCallback) fnCallback();
        }, 3000); //
    }
}

overlayStart.onclick = () => {
    overlayStart.style.opacity = '0';
    setTimeout(() => overlayStart.remove(), 1000);
    typeSound.play().then(() => { typeSound.pause(); typeSound.currentTime = 0; });
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
        
        // Базовая форма
        this.baseTargetX = x_base * settings.heartSize;
        this.baseTargetY = y_base * settings.heartSize;

        this.x = 0; this.y = 0;
        const angle = Math.random() * Math.PI * 2;
        const force = Math.random() * 12;
        this.vx = Math.cos(angle) * force;
        this.vy = Math.sin(angle) * force;
        this.size = Math.random() * 2 + 0.5;
        
        // Индивидуальные параметры для "живого" плавания
        this.randX = (Math.random() - 0.5) * settings.jitter;
        this.randY = (Math.random() - 0.5) * settings.jitter;
        this.offset = Math.random() * Math.PI * 2;
    }

    update() {
        if (!heartFormed) {
            // Разлет при нажатии
            this.x += (this.baseTargetX + this.randX - this.x) * settings.ease + this.vx;
            this.y += (this.baseTargetY + this.randY - this.y) * settings.ease + this.vy;
            this.vx *= 0.96; this.vy *= 0.96;
        } else {
            // Эффект "живого" сердца: пульсация + легкое плавание частиц
            const time = Date.now() * 0.001;
            const pulse = Math.sin(time * 1.5) * 0.03 + 1; // Общая пульсация
            
            // Маленькое индивидуальное движение внутри облака (jitter)
            const driftX = Math.sin(time + this.offset) * 5;
            const driftY = Math.cos(time + this.offset) * 5;

            this.x += ((this.baseTargetX * pulse) + this.randX + driftX - this.x) * 0.04;
            this.y += ((this.baseTargetY * pulse) + this.randY + driftY - this.y) * 0.04;
        }
    }

    draw() {
        ctx.fillStyle = `rgba(255, 0, 85, ${globalOpacity})`; //
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
                        div.className = 'msg'; div.textContent = m;
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
    }, 1200);
};

// Таймер и Сброс
document.getElementById('show-timer-btn').onclick = function() {
    this.classList.remove('show');
    setTimeout(() => {
        this.classList.add('hidden-logic');
        const t = document.getElementById('timer');
        t.classList.remove('hidden-logic');
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

document.getElementById('reset-btn').onclick = function() {
    const fadeDuration = 2000;
    const start = Date.now();
    (function fade() {
        const elapsed = Date.now() - start;
        globalOpacity = Math.max(0, 1 - (elapsed / fadeDuration));
        if (globalOpacity > 0) requestAnimationFrame(fade);
    })();
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