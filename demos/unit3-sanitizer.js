// ============================================================
// Syllabus Unit 3: Advanced JS, RegExp & Input Sanitization
// Defends against Cross-Site Scripting (XSS) & Script Injection
// ============================================================

// 1. Regular Expressions for Form Validation
const Patterns = {
  phone: /^[0-9]{10}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  licensePlate: /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/i,
  coordinates: /^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}/
};

// 2. Input Sanitization Function (Neutralizes script tags and HTML markup)
function sanitizeText(rawString) {
  if (typeof rawString !== 'string') return '';
  return rawString
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip <script>...</script>
    .replace(/</g, '&lt;') // Neutralize open brackets
    .replace(/>/g, '&gt;') // Neutralize close brackets
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

// 3. DOM Safe Text Renderer (Uses textContent rather than innerHTML)
function renderSafe(containerElement, text) {
  containerElement.textContent = text; // Safe: browser treats input strictly as text, not HTML
}

if (typeof module !== 'undefined') {
  module.exports = { Patterns, sanitizeText, renderSafe };
}
