// auth-manager.js - Helpers de sidebar compartidos entre páginas

function updateSidebarUserInfo(user) {
  const userNameElement = document.getElementById('sidebar-user-name');
  const userEmailElement = document.getElementById('sidebar-user-email');
  const userPicElement = document.getElementById('sidebar-user-pic');

  if (userNameElement && userEmailElement && userPicElement) {
    userNameElement.textContent = user.displayName || user.email || 'Utilisateur';
    userEmailElement.textContent = user.email || '';
    userPicElement.src = user.photoURL ||
      'https://ui-avatars.com/api/?name=' + encodeURIComponent(userNameElement.textContent) + '&background=random';
  }
}

window.updateSidebarUserInfo = updateSidebarUserInfo;
