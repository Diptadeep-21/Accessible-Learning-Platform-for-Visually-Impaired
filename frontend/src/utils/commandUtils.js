// Normalize voice commands into known actions
export const normalizeCommand = (cmd) => {
  const c = cmd.toLowerCase().trim();

  if (c.includes('list') || c.includes('least') || c.includes('show')) return 'list';
  if (c.includes('next') || c.includes('neck') || c.includes('text')) return 'next';
  if (c.includes('details') || c.includes('info') || c.includes('tell me more')) return 'details';
  if (c.includes('progress') || c.includes('status')) return 'progress';
  if (c.includes('open') || c.includes('open one') || c.includes('start') || c.includes('begin')) return 'open';
  if (c.includes('quiz') || c.includes('start quiz') || c.includes('begin test') || c.includes('quick')) return 'quiz';
  if (c.includes('repeat') || c.includes('again')) return 'repeat';

  return 'unknown';
};
