/**
 * Обчислює суму двох чисел.
 *
 * @param {number} a - Перше число
 * @param {number} b - Друге число
 * @returns {number} - Сума чисел a та b
 *
 * @example
 * const result = sum(2, 3);
 * console.log(result); // 5
 */
function sum(a, b) {
  return a + b;
}
/**
 * Ініціалізує кнопку "Scroll to Top" після завантаження сторінки.
 * Показує кнопку при прокрутці > 300px та плавно прокручує сторінку вгору при кліку.
 *
 * @fires window#scroll
 * @fires HTMLButtonElement#click
 *
 * @example
 * // Автоматично викликається після завантаження сторінки
 */
document.addEventListener('DOMContentLoaded', () => {
    /**
     * Кнопка "Scroll to Top"
     * @type {HTMLButtonElement}
     */
    const scrollBtn = document.getElementById('scrollTopBtn');

    /**
     * Показує або приховує кнопку при прокрутці
     * @listens window#scroll
     */
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.classList.add('show');
        } else {
            scrollBtn.classList.remove('show');
        }
    });

    /**
     * Прокручує сторінку вгору плавно при кліку
     * @listens HTMLButtonElement#click
     */
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
