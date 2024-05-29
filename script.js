function getCurrentFolderName() {
  const pathParts = window.location.pathname.split('/');
  const folderName = pathParts[pathParts.length - 2] || 'LiminalWebUI';
  return folderName;
}

function changeTitle() {
  const folderName = getCurrentFolderName();
  document.title = folderName;
}

function changeH1() {
  const folderName = getCurrentFolderName();
  const h1Element = document.getElementById("mainTitle");
  h1Element.textContent = folderName;
}