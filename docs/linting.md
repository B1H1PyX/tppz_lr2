# Linting

## Обраний лінтер
Для проєкту використано ESLint — стандартний інструмент статичного аналізу JavaScript.

## Причини вибору
- Виявлення помилок без запуску коду
- Підвищення читабельності
- Підтримка Git hooks
- Інтеграція з CI/CD

## Основні правила
- eqeqeq — заборона нестрогих порівнянь
- no-unused-vars — виявлення зайвих змінних
- semi — обов’язкові крапки з комою
- quotes — одинарні лапки

## Запуск лінтера
```bash
npx eslint scripts/script.js
```

## Результати запуску
Початково виявлено: 7 проблем  
Виправлено: 7  
Відсоток: 100%

```bash
   1:27  error  Strings must use singlequote  quotes
   2:47  error  Strings must use singlequote  quotes
   4:29  error  Strings must use singlequote  quotes
   6:37  error  Strings must use singlequote  quotes
   8:40  error  Strings must use singlequote  quotes
  12:32  error  Strings must use singlequote  quotes
  15:23  error  Strings must use singlequote  quotes
```

Другий запуск лінтера не показав жодних проблем