/**
 * js/main.js
 * 로그인 확인, 로그인/로그아웃, 사이드바 네비게이션
 */

const SECTIONS = {
    home: { title: '대시보드 홈', load: () => loadHomeStats() },
    quotes: { title: '명언 관리', load: () => loadQuotes() },
};

function showLogin() {
    document.getElementById('adminView').hidden = true;
    document.getElementById('loginView').hidden = false;
}

function showAdmin(admin) {
    document.getElementById('loginView').hidden = true;
    document.getElementById('adminView').hidden = false;
    document.getElementById('adminUserArea').textContent = `${admin.name} 관리자님`;
    navigate(location.hash.slice(1) in SECTIONS ? location.hash.slice(1) : 'home');
}

function navigate(target) {
    document.querySelectorAll('.admin-nav-item[data-target]').forEach((nav) => {
        nav.classList.toggle('active', nav.dataset.target === target);
    });
    Object.keys(SECTIONS).forEach((key) => {
        document.getElementById(key + 'Section').hidden = key !== target;
    });
    document.getElementById('pageTitle').textContent = SECTIONS[target].title;
    history.replaceState(null, '', '#' + target);
    SECTIONS[target].load();
    document.getElementById('sidebarMenu').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', async () => {
    document.querySelectorAll('.admin-nav-item[data-target]').forEach((item) => {
        item.addEventListener('click', () => navigate(item.dataset.target));
    });
    document.getElementById('mobileMenuToggle').addEventListener('click', () => {
        document.getElementById('sidebarMenu').classList.toggle('active');
    });

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const errorEl = document.getElementById('loginError');
        errorEl.hidden = true;
        try {
            const data = await api('auth/login.php', {
                method: 'POST',
                body: { username: form.username.value, password: form.password.value },
            });
            setCsrfToken(data.csrf);
            form.reset();
            showAdmin(data.admin);
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.hidden = false;
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            await api('auth/logout.php', { method: 'POST', body: {} });
        } finally {
            setCsrfToken('');
            showLogin();
        }
    });

    initQuotes();

    try {
        const data = await api('auth/session.php');
        if (data.loggedIn) {
            setCsrfToken(data.csrf);
            showAdmin(data.admin);
        } else {
            showLogin();
        }
    } catch (err) {
        showLogin();
        toast(err.message, true);
    }
});
