import sys
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import subprocess

class Watcher:
    def __init__(self, directory_to_watch, command_to_run):
        self.DIRECTORY_TO_WATCH = directory_to_watch
        self.command_to_run = command_to_run
        self.observer = Observer()

    def run(self):
        event_handler = Handler(self.command_to_run)
        self.observer.schedule(event_handler, self.DIRECTORY_TO_WATCH, recursive=True)
        self.observer.start()
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.observer.stop()
        self.observer.join()

class Handler(FileSystemEventHandler):
    def __init__(self, command_to_run):
        self.command_to_run = command_to_run
        self.process = None
        self.run_command()

    def run_command(self):
        if self.process:
            self.process.terminate()
        self.process = subprocess.Popen(self.command_to_run, shell=True)

    def on_any_event(self, event):
        if event.is_directory:
            return None
        elif event.event_type in ('created', 'modified', 'deleted'):
            print(f"Received event - {event.src_path}. Restarting process...")
            self.run_command()

if __name__ == '__main__':
    directory_to_watch = "src"  # Répertoire à surveiller
    command_to_run = "python3 src/SpotTube.py"  # Commande à exécuter
    watcher = Watcher(directory_to_watch, command_to_run)
    watcher.run()
