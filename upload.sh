#!/bin/bash

echo "🚀 Начинаю загрузку на GitHub..."

echo "🔄 Проверяю обновления..."
git pull origin main --rebase || true

git add .

echo "📦 Упаковываю файлы..."
git commit -m "Авто-обновление сайта: $(date)"

echo "☁️ Отправляю в облако..."
git push -u origin main

echo "✅ Готово! Сайт обновится через пару минут."
echo "👉 https://attackuwu.github.io"
