/**
 * js/categories.js
 * 앱의 data/quote-categories.ts와 같은 카테고리 정의.
 * 앱에서 카테고리를 바꾸면 이 파일과 api/common/quote.php의 QUOTE_CATEGORIES도 함께 바꾼다.
 */

const CATEGORIES = [
    { id: 'success', label: '성공·도전', emoji: '🏆', pattern: /성공|승리|목표|성취|도전|실패|야망|기회|꿈(?!틀)/ },
    { id: 'effort', label: '노력·끈기', emoji: '💪', pattern: /노력|끈기|인내|근면|부지런|꾸준|습관|게으|나태|포기|참을성|땀/ },
    { id: 'courage', label: '용기·희망', emoji: '🔥', pattern: /용기|희망|두려움|두려워|자신감|신념|극복|시련|고난|역경|절망|좌절/ },
    { id: 'happiness', label: '행복', emoji: '☀️', pattern: /행복|기쁨|즐거움|웃음|감사|만족/ },
    { id: 'love', label: '사랑', emoji: '💗', pattern: /사랑|연애|애정|연인|결혼/ },
    { id: 'relation', label: '우정·관계', emoji: '🤝', pattern: /친구|우정|이웃|가족|부모|자식|형제|동료/ },
    { id: 'life', label: '인생', emoji: '🌱', pattern: /인생|삶|죽음|세월|청춘|젊음|늙|노년/ },
    { id: 'wisdom', label: '지혜·배움', emoji: '📚', pattern: /지혜|지식|배움|배우|공부|독서|학문|진리|교육|현명|서적|(^|[^방대정산자비실])책(을|은|이|의|에|과|만|도)/ },
    {
        id: 'bible',
        label: '성경',
        emoji: '📖',
        authorPattern:
            /(^|[^가-힣])성경|성서|구약|신약|복음|(^|『|성서 ?|성경,? ?|구약 ?)잠언|시편|서편|욥기|전도서|아가서|창세기|레위기|신명기|이사야|로마서|에베소서|갈라디아|데살로니가|디모데|베드로전서|요한1서|사도행전|히브리서|^예수|^솔로몬/,
    },
];

const categoryById = new Map(CATEGORIES.map((c) => [c.id, c]));

function categoryLabel(id) {
    const c = categoryById.get(id);
    return c ? `${c.emoji} ${c.label}` : id;
}

/** 카테고리를 지정하지 않았을 때 앱이 키워드로 분류할 카테고리 id 목록 */
function autoCategories(text, author) {
    return CATEGORIES
        .filter((c) => c.pattern?.test(text) || c.authorPattern?.test(author))
        .map((c) => c.id);
}
