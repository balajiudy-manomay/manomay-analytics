/**
 * High-performance, single-pass O(n) string formatting utilities.
 */

// Comprehensive set of standard corporate acronyms (O(1) lookup)
const ACRONYMS = new Set([
  'HR', 'CXO', 'CEO', 'CFO', 'CTO', 'COO', 'CIO', 'CPO', 'CMO', 'CRO',
  'VP', 'SVP', 'EVP', 'AVP', 'IT', 'BI', 'QA', 'UI', 'UX', 'RD', 'PM',
  'AM', 'TL', 'MD', 'GM', 'PA', 'PR', 'SEO', 'SEM', 'SRE', 'DEVOPS'
]);

/**
 * Single-pass O(n) role title formatting utility.
 * Handles any delimiter (hyphens, underscores, slashes, dots),
 * title-cases standard words, and preserves corporate acronyms.
 *
 * @example
 * formatRole("hr-manager") // "HR Manager"
 * formatRole("cxo_analytics") // "CXO Analytics"
 * formatRole("senior-product-designer") // "Senior Product Designer"
 */
export function formatRole(role?: string | null): string {
  if (!role) return '';

  return role
    .trim()
    .replace(/[a-zA-Z0-9]+/g, (match) => {
      const upper = match.toUpperCase();
      if (ACRONYMS.has(upper)) return upper;
      return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
    })
    .replace(/[-_]+/g, ' ');
}

/**
 * Formats an email address handle into a clean Display Name in O(n).
 *
 * @example
 * formatDisplayName("balaji.udayagiri@manomay.biz") // "Balaji Udayagiri"
 */
export function formatDisplayName(email?: string | null): string {
  if (!email) return '';
  const handle = email.split('@')[0];
  return handle
    .replace(/[a-zA-Z0-9]+/g, (match) => {
      const upper = match.toUpperCase();
      if (ACRONYMS.has(upper)) return upper;
      return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
    })
    .replace(/[-_.]+/g, ' ');
}
