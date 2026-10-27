/**
 * js/quotes.js
 * 명언 관리: 검색·필터·페이지 목록, 추가/수정 모달, 대표 토글, 삭제
 */

const quoteState = { page: 1, limit: 20, items: [] };

function initQuotes() {
    const categoryFilter = document.getElementById('quoteCategoryFilter');
    categoryFilter.insertAdjacentHTML('beforeend',
        CATEGORIES.map((c) => `<option value="${c.id}">${c.emoji} ${c.label}</option>`).join(''));

    document.getElementById('quoteCategoryChecks').innerHTML = CATEGORIES.map((c) => `
        <label class="check"><input type="checkbox" name="categories" value="${c.id}"> ${c.emoji} ${c.label}</label>`).join('');

    let searchTimer;
    document.getElementById('quoteSearch').addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => loadQuotes(1), 300);
    });
    ['quoteCategoryFilter', 'quoteFeaturedFilter', 'quoteSort'].forEach((id) => {
        document.getElementById(id).addEventListener('change', () => loadQuotes(1));
    });

    document.getElementById('addQuoteBtn').addEventListener('click', () => openQuoteDialog());
    document.getElementById('quoteCancelBtn').addEventListener('click', () => document.getElementById('quoteDialog').close());

    const form = document.getElementById('quoteForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveQuote();
    });
    form.elements.text.addEventListener('input', updateAutoCategories);
    form.elements.author.addEventListener('input', updateAutoCategories);
    form.addEventListener('change', (e) => {
        if (e.target.name === 'categories') updateAutoCategories();
    });

    document.getElementById('quoteBody').addEventListener('click', onQuoteTableClick);
}

async function loadQuotes(page = quoteState.page) {
    quoteState.page = page;
    const body = document.getElementById('quoteBody');
    const params = {
        q: document.getElementById('quoteSearch').value.trim(),
        category: document.getElementById('quoteCategoryFilter').value,
        featured: document.getElementById('quoteFeaturedFilter').checked ? '1' : '',
        sort: document.getElementById('quoteSort').value,
        page,
        limit: quoteState.limit,
    };
    try {
        const data = await api('quote/list.php', { params });
        quoteState.items = data.data;
        document.getElementById('quoteCount').textContent = `${data.total.toLocaleString()}개`;
        body.innerHTML = data.data.map(renderQuoteRow).join('')
            || '<tr><td colspan="6" class="empty">조건에 맞는 명언이 없습니다.</td></tr>';
        renderPager(data.total);
    } catch (err) {
        body.innerHTML = `<tr><td colspan="6" class="form-error">${escapeHtml(err.message)}</td></tr>`;
    }
}

function renderQuoteRow(q) {
    const categories = q.categories
        ? q.categories.map((id) => `<span class="tag">${escapeHtml(categoryLabel(id))}</span>`).join('')
        : autoCategories(q.text, q.author).map((id) => `<span class="tag auto" title="자동 분류">${escapeHtml(categoryLabel(id))}</span>`).join('') || '<span class="muted small">—</span>';
    return `
        <tr data-id="${q.id}">
            <td>${q.id}</td>
            <td class="quote-text">${escapeHtml(q.text)}</td>
            <td>${escapeHtml(q.author) || '<span class="muted">작자 미상</span>'}</td>
            <td class="tags">${categories}</td>
            <td><button class="star ${q.featured ? 'on' : ''}" data-action="featured" title="대표 명언 켜기/끄기">${q.featured ? '★' : '☆'}</button></td>
            <td class="actions">
                <button class="admin-btn" data-action="edit">수정</button>
                <button class="admin-btn admin-btn-danger" data-action="delete">삭제</button>
            </td>
        </tr>`;
}

function renderPager(total) {
    const pages = Math.max(1, Math.ceil(total / quoteState.limit));
    const current = quoteState.page;
    const start = Math.max(1, current - 2);
    const end = Math.min(pages, start + 4);
    let html = `<button class="admin-btn" data-page="${current - 1}" ${current <= 1 ? 'disabled' : ''}>이전</button>`;
    for (let p = start; p <= end; p++) {
        html += `<button class="admin-btn ${p === current ? 'admin-btn-primary' : ''}" data-page="${p}">${p}</button>`;
    }
    html += `<button class="admin-btn" data-page="${current + 1}" ${current >= pages ? 'disabled' : ''}>다음</button>`;
    html += `<span class="muted small">${current} / ${pages}</span>`;
    const pager = document.getElementById('quotePager');
    pager.innerHTML = html;
    pager.querySelectorAll('[data-page]').forEach((btn) => {
        btn.addEventListener('click', () => loadQuotes(Number(btn.dataset.page)));
    });
}

async function onQuoteTableClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = Number(btn.closest('tr').dataset.id);
    const quote = quoteState.items.find((q) => q.id === id);
    if (!quote) return;

    if (btn.dataset.action === 'edit') {
        openQuoteDialog(quote);
    } else if (btn.dataset.action === 'featured') {
        try {
            const data = await api('quote/featured.php', { method: 'POST', body: { id, featured: !quote.featured } });
            quote.featured = data.featured;
            btn.classList.toggle('on', quote.featured);
            btn.textContent = quote.featured ? '★' : '☆';
        } catch (err) {
            toast(err.message, true);
        }
    } else if (btn.dataset.action === 'delete') {
        if (!confirm(`#${id} 명언을 삭제할까요?\n\n"${quote.text}"`)) return;
        try {
            await api('quote/delete.php', { method: 'POST', body: { id } });
            toast('삭제했습니다.');
            loadQuotes();
        } catch (err) {
            toast(err.message, true);
        }
    }
}

function openQuoteDialog(quote) {
    const form = document.getElementById('quoteForm');
    form.reset();
    form.elements.id.value = quote?.id ?? '';
    form.elements.text.value = quote?.text ?? '';
    form.elements.author.value = quote?.author ?? '';
    form.elements.featured.checked = !!quote?.featured;
    form.querySelectorAll('input[name="categories"]').forEach((input) => {
        input.checked = !!quote?.categories?.includes(input.value);
    });
    document.getElementById('quoteDialogTitle').textContent = quote ? `명언 수정 #${quote.id}` : '명언 추가';
    document.getElementById('quoteFormError').hidden = true;
    updateAutoCategories();
    document.getElementById('quoteDialog').showModal();
    form.elements.text.focus();
}

/** 카테고리를 하나도 고르지 않았으면 앱이 자동으로 붙일 카테고리를 미리 보여준다. */
function updateAutoCategories() {
    const form = document.getElementById('quoteForm');
    const checked = form.querySelectorAll('input[name="categories"]:checked').length > 0;
    const el = document.getElementById('quoteAutoCategories');
    if (checked) {
        el.textContent = '지정한 카테고리로만 분류됩니다.';
        return;
    }
    const auto = autoCategories(form.elements.text.value, form.elements.author.value);
    el.textContent = auto.length
        ? `미지정 시 자동 분류: ${auto.map(categoryLabel).join(', ')}`
        : '미지정 시 자동 분류: 없음 (\'전체\'에서만 보임)';
}

async function saveQuote(force = false) {
    const form = document.getElementById('quoteForm');
    const errorEl = document.getElementById('quoteFormError');
    errorEl.hidden = true;
    const body = {
        id: Number(form.elements.id.value) || 0,
        text: form.elements.text.value,
        author: form.elements.author.value,
        featured: form.elements.featured.checked,
        categories: [...form.querySelectorAll('input[name="categories"]:checked')].map((i) => i.value),
        force,
    };
    try {
        await api('quote/save.php', { method: 'POST', body });
        document.getElementById('quoteDialog').close();
        toast(body.id ? '수정했습니다.' : '추가했습니다.');
        loadQuotes(body.id ? quoteState.page : 1);
    } catch (err) {
        if (err.status === 409 && confirm(`${err.message}\n그래도 저장할까요?`)) {
            return saveQuote(true);
        }
        errorEl.textContent = err.message;
        errorEl.hidden = false;
    }
}
