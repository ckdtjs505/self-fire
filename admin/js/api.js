/**
 * js/api.js
 * 어드민 API 호출 공통 함수와 화면 유틸
 */

const API_BASE = 'api/';
let csrfToken = '';

function setCsrfToken(token) {
    csrfToken = token || '';
}

/** API를 호출하고 JSON을 돌려준다. 실패하면 서버 메시지로 Error를 던진다. */
async function api(path, { method = 'GET', body, params } = {}) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await fetch(API_BASE + path + query, {
        method,
        credentials: 'same-origin',
        headers: body ? { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken } : { 'X-CSRF-Token': csrfToken },
        body: body ? JSON.stringify(body) : undefined,
    });
    let data;
    try {
        data = await res.json();
    } catch {
        throw new Error(`서버 응답을 읽을 수 없습니다. (${res.status})`);
    }
    if (res.status === 401 && path !== 'auth/login.php') {
        // 세션 만료: 로그인 화면으로
        showLogin();
    }
    if (!res.ok || data.status !== 'success') {
        const err = new Error(data.message || `요청 실패 (${res.status})`);
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return data;
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

let toastTimer;
function toast(message, isError = false) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.classList.toggle('error', isError);
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2500);
}
