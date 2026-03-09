document.addEventListener('DOMContentLoaded', () => {
    const textElement = document.getElementById('typewriter');
    const textToType = "Привет, я программист и фанат Open Source";
    const typingSpeed = 80; // Чуть замедлил скорость для красоты
    const cursor = "█";
    let charIndex = 0;

    // Эффект печатающей машинки
    function typeWriter() {
        if (charIndex < textToType.length) {
            textElement.textContent = textToType.substring(0, charIndex + 1) + cursor;
            charIndex++;
            setTimeout(typeWriter, typingSpeed);
        } else {
            blinkCursor();
        }
    }

    let isCursorVisible = true;
    function blinkCursor() {
        setInterval(() => {
            textElement.textContent = isCursorVisible ? textToType : textToType + cursor;
            isCursorVisible = !isCursorVisible;
        }, 500); 
    }

    setTimeout(typeWriter, 500);

    // Плавная прокрутка для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
