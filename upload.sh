#!/bin/bash

echo "🚀 Начинаю загрузку на GitHub..."

# 0. Синхронизация с облаком (чтобы не было конфликтов)
echo "🔄 Проверяю обновления..."
git pull origin main --rebase || true

# 1. Добавляем все новые файлы
git add .

# 2. Сохраняем изменения (Коммит)
echo "📦 Упаковываю файлы..."
git commit -m "Авто-обновление сайта: $(date)"

# 3. Отправляем на GitHub
echo "☁️ Отправляю в облако..."
git push -u origin main

echo "✅ Готово! Сайт обновится через пару минут."
echo "👉 https://attackuwu.github.io"
