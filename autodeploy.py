import os
import time
import subprocess
import sys

# Directory to watch (current directory)
WATCH_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_SCRIPT = os.path.join(WATCH_DIR, "upload.sh")

def get_mtime_recursive(directory):
    """
    Recursively get modification times of all files in the directory.
    Excludes .git directory.
    """
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
    
    # Store initial state
    last_mtimes = get_mtime_recursive(WATCH_DIR)

    while True:
        try:
            time.sleep(2) # Check every 2 seconds
            current_mtimes = get_mtime_recursive(WATCH_DIR)
            
            # Compare current state with last state
            if current_mtimes != last_mtimes:
                print("\n📝 Обнаружено изменение файла!")
                print("⏳ Запускаю загрузку на GitHub...")
                
                # Execute the upload script
                result = subprocess.run(["bash", UPLOAD_SCRIPT], cwd=WATCH_DIR)
                
                if result.returncode == 0:
                    print("✅ Загрузка успешно завершена.")
                else:
                    print("❌ Ошибка при загрузке.")
                
                # Update the last known state to the current state
                # We do this AFTER the script runs so we don't trigger on git changes immediately 
                # (though .git is excluded, git might touch other things or script might update timestamps)
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
