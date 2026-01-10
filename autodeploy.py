import os
import time
import subprocess
import sys

WATCH_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_SCRIPT = os.path.join(WATCH_DIR, "upload.sh")

def get_mtime_recursive(directory):
    mtimes = {}
    for root, dirs, files in os.walk(directory):
        if ".git" in root:
            continue
        for f in files:
            path = os.path.join(root, f)
            try:
                mtimes[path] = os.path.getmtime(path)
            except OSError:
                pass
    return mtimes

def main():
    print(f"👀 Запущен авто-загрузчик. Слежу за папкой: {WATCH_DIR}")
    print("✨ При изменении любого файла будет выполнен git push.")
    
    last_mtimes = get_mtime_recursive(WATCH_DIR)

    while True:
        try:
            time.sleep(2)
            current_mtimes = get_mtime_recursive(WATCH_DIR)
            
            if current_mtimes != last_mtimes:
                print("\n📝 Обнаружено изменение файла!")
                print("⏳ Запускаю загрузку на GitHub...")
                
                result = subprocess.run(["bash", UPLOAD_SCRIPT], cwd=WATCH_DIR)
                
                if result.returncode == 0:
                    print("✅ Загрузка успешно завершена.")
                else:
                    print("❌ Ошибка при загрузке.")
                
                last_mtimes = get_mtime_recursive(WATCH_DIR)
                print("👀 Продолжаю наблюдение...")

        except KeyboardInterrupt:
            print("\n🛑 Авто-загрузчик остановлен.")
            sys.exit(0)
        except Exception as e:
            print(f"⚠️ Ошибка: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
