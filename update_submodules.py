import json
import os
import subprocess

CANVAS_FILE = "DreamSong.canvas"
BASE_URL = "https://github.com/InterfaceGuy/"

def parse_canvas_file(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    repos = []
    for node in data['nodes']:
        if node['type'] == 'file' and node['file'].endswith('README.md'):
            repo_name = node['file'].split('/')[0]
            repos.append(repo_name)
    return repos

def update_submodules(repos):
    # Read the current submodules from .gitmodules
    current_submodules = []
    if os.path.exists('.gitmodules'):
        with open('.gitmodules', 'r') as file:
            for line in file:
                if 'path' in line:
                    current_submodules.append(line.split('=')[1].strip())

    # Determine submodules to add and remove
    to_add = set(repos) - set(current_submodules)
    to_remove = set(current_submodules) - set(repos)

    # Add new submodules
    for repo in to_add:
        url = f"{BASE_URL}{repo}.git"
        subprocess.run(['git', 'submodule', 'add', url, repo])

    # Remove old submodules
    for repo in to_remove:
        # don't remove LiminalWebUI itself
        if repo == "LiminalWebUI":
            continue
        subprocess.run(['git', 'submodule', 'deinit', '-f', repo])
        subprocess.run(['git', 'rm', '-f', repo])
        subprocess.run(['rm', '-rf', f'.git/modules/{repo}'])

    # Update the submodules
    subprocess.run(['git', 'submodule', 'update', '--init', '--recursive'])

if __name__ == "__main__":
    repos = parse_canvas_file(CANVAS_FILE)
    update_submodules(repos)