export const highlightText = (text: string, searchTerm: string): string => {
  if (!searchTerm || !text) return text;

  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

export const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export const searchInFAQ = (faq: any, searchTerm: string): boolean => {
  if (!searchTerm) return true;

  const searchLower = searchTerm.toLowerCase();
  const searchableText = [
    faq.question,
    faq.answer,
    faq.category,
    ...(faq.tags || [])
  ].join(' ').toLowerCase();

  return searchableText.includes(searchLower);
};

export const getSearchSnippet = (text: string, searchTerm: string, maxLength: number = 150): string => {
  if (!searchTerm || !text) return text.substring(0, maxLength);

  const searchIndex = text.toLowerCase().indexOf(searchTerm.toLowerCase());
  if (searchIndex === -1) return text.substring(0, maxLength);

  const start = Math.max(0, searchIndex - 50);
  const end = Math.min(text.length, searchIndex + searchTerm.length + 50);

  let snippet = text.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';

  return snippet;
};