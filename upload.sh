#!/bin/bash
git pull origin main --rebase || true
git add .
git commit -m "Авто-обновление сайта: $(date)"
git push -u origin main
