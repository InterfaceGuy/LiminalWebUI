import json
import os
import subprocess

CANVAS_FILE = "DreamSong.canvas"
BASE_URL = "https://github.com/InterfaceGuy/"
DIRECTORY_LISTING_FILE = "directory-listing.json"

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
    # Update existing submodules to the latest commit on the main branch
    for repo in current_submodules:
        if repo not in to_remove:
            subprocess.run(['git', 'submodule', 'update', '--remote', repo])
            subprocess.run(['git', 'submodule', 'foreach', f'git checkout main && git pull origin main'], cwd=repo)
    # Initialize and update the submodules
    subprocess.run(['git', 'submodule', 'update', '--init', '--recursive'])

def generate_directory_listing(root_dir):
    directory_listing = {}

    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if not d.startswith('.')]  # Filter out hidden directories
        files = [f for f in files if not f.startswith('.')]  # Filter out hidden files

        relative_root = os.path.relpath(root, root_dir)

        if relative_root == '.':
            current_dir = directory_listing
        else:
            current_dir = directory_listing.setdefault(relative_root, {})

        for file in files:
            file_path = os.path.join(relative_root, file)
            current_dir[file] = None

        for dir in dirs:
            dir_path = os.path.join(relative_root, dir)
            current_dir[dir] = {}

    return directory_listing

if __name__ == "__main__":
    repos = parse_canvas_file(CANVAS_FILE)
    update_submodules(repos)
    root_dir = "."  # Change this to the desired root directory
    directory_listing = generate_directory_listing(root_dir)

    with open("directory-listing.json", "w") as file:
        json.dump(directory_listing, file, indent=2)