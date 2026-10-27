/**
 * js/home.js
 * 대시보드 홈: 요약 카드, 카테고리별 지정 수, 최근 추가된 명언
 */

async function loadHomeStats() {
    const statsEl = document.getElementById('homeStats');
    try {
        const { data } = await api('quote/stats.php');

        const cards = [
            ['전체 명언', data.total],
            ['대표 명언', data.featured],
            ['카테고리 지정', data.categorized],
            ['자동 분류', data.total - data.categorized],
            ['마지막 ID', data.maxId],
        ];
        statsEl.innerHTML = cards.map(([label, value]) => `
            <div class="stat-card">
                <div class="stat-label">${label}</div>
                <div class="stat-value">${Number(value).toLocaleString()}</div>
            </div>`).join('');

        const max = Math.max(1, ...Object.values(data.byCategory));
        document.getElementById('homeCategories').innerHTML = CATEGORIES.map((c) => {
            const count = data.byCategory[c.id] ?? 0;
            return `
                <div class="category-bar">
                    <span class="category-name">${c.emoji} ${c.label}</span>
                    <span class="bar"><span style="width:${(count / max) * 100}%"></span></span>
                    <span class="category-count">${count.toLocaleString()}</span>
                </div>`;
        }).join('');

        document.getElementById('homeRecentBody').innerHTML = data.recent.map((q) => `
            <tr>
                <td>${q.id}</td>
                <td class="quote-text">${escapeHtml(q.text)}</td>
                <td>${escapeHtml(q.author)}</td>
            </tr>`).join('') || '<tr><td colspan="3" class="empty">명언이 없습니다.</td></tr>';
    } catch (err) {
        statsEl.innerHTML = `<p class="form-error">${escapeHtml(err.message)}</p>`;
    }
}
