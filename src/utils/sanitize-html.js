import DOMPurify from 'dompurify'

// 統一的 v-html 消毒函式：僅允許安全的排版標籤 <br>，其餘標籤/屬性一律移除
// 用於防止 XSS（CWE-79），任何綁定到 v-html 的動態內容都必須先經過此函式
export const sanitize_html = (dirty) => {
    if (!dirty) return ''

    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['br'],
        ALLOWED_ATTR: [],
    })
}
