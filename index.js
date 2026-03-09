document.addEventListener('DOMContentLoaded', () => {
    const textElement = document.getElementById('typewriter');
    const textToType = "Привет, я разработчик и Red Team Operator";
    const typingSpeed = 70; // Скорость печати в миллисекундах
    const cursor = "█";
    let charIndex = 0;

    // Эффект печатающей машинки
    function typeWriter() {
        if (charIndex < textToType.length) {
            // Добавляем символ и сохраняем курсор
            textElement.textContent = textToType.substring(0, charIndex + 1) + cursor;
            charIndex++;
            setTimeout(typeWriter, typingSpeed);
        } else {
            // Когда текст напечатан, заставляем курсор мигать
            blinkCursor();
        }
    }

    let isCursorVisible = true;
    function blinkCursor() {
        setInterval(() => {
            if (isCursorVisible) {
                textElement.textContent = textToType;
            } else {
                textElement.textContent = textToType + cursor;
            }
            isCursorVisible = !isCursorVisible;
        }, 500); // Скорость мигания курсора
    }

    // Запуск анимации с небольшой задержкой после загрузки страницы
    setTimeout(typeWriter, 500);

    // Плавная прокрутка для якорных ссылок (на случай если браузер не поддерживает scroll-behavior в CSS)
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
