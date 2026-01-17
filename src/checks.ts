
import { TFile } from 'obsidian';
import GhostPublisherPlugin from './main';
import { getGhostPayload } from './frontmatter';

export type CheckStatus = 'ok' | 'warn' | 'fail';

export interface CheckItem {
  id: string;
  label: string;
  status: CheckStatus;
  details?: string;
}

export interface CheckResults {
  isValid: boolean;
  items: CheckItem[];
  errors: string[];
}

export async function runDetailedChecks(plugin: GhostPublisherPlugin, file: TFile): Promise<CheckResults> {
  const items: CheckItem[] = [];
  // Fix: Access app via any cast to bypass missing property error
  const content = await (plugin as any).app.vault.read(file);
  // Fix: Access app via any cast to bypass missing property error
  const payload = await getGhostPayload((plugin as any).app, file);

  // 1. Title Check
  if (payload.title && payload.title.trim().length > 0) {
    items.push({ id: 'title', label: 'Resolved Title', status: 'ok', details: `Title: "${payload.title}"` });
  } else {
    items.push({ id: 'title', label: 'Resolved Title', status: 'fail', details: 'No title could be found in frontmatter, H1, or filename.' });
  }

  // 2. H1 Presence Check
  const h1Match = content.match(/^#\s+(.*)$/m);
  if (h1Match) {
    items.push({ id: 'h1', label: 'H1 Header', status: 'ok', details: 'Found top-level H1 header.' });
  } else {
    items.push({ id: 'h1', label: 'H1 Header', status: 'fail', details: 'No H1 (# Header) found in content. Ghost usually expects an H1.' });
  }

  // 3. Content Length Check
  const minLength = 100;
  const actualLength = content.trim().length;
  if (actualLength >= minLength) {
    items.push({ id: 'length', label: 'Content Length', status: 'ok', details: `${actualLength} characters.` });
  } else {
    items.push({ id: 'length', label: 'Content Length', status: 'warn', details: `Note is very short (${actualLength} chars). Minimal recommended is ${minLength}.` });
  }

  // 4. Feature Image URL Check
  if (payload.feature_image) {
    const urlRegex = /^(https?:\/\/)[^\s$.?#].[^\s]*$/i;
    if (urlRegex.test(payload.feature_image)) {
      items.push({ id: 'image', label: 'Feature Image', status: 'ok', details: 'Valid URL format.' });
    } else {
      items.push({ id: 'image', label: 'Feature Image', status: 'warn', details: 'URL format seems invalid (must start with http/https).' });
    }
  }

  // 5. Excerpt Check
  if (payload.excerpt && payload.excerpt.trim().length > 0) {
    items.push({ id: 'excerpt', label: 'Excerpt', status: 'ok' });
  } else {
    items.push({ id: 'excerpt', label: 'Excerpt', status: 'warn', details: 'No excerpt provided. Ghost will auto-generate one.' });
  }

  // 6. Link Validation
  const linkRegex = /\[.*?\]\((.*?)\)/g;
  let match;
  let hasSuspiciousLinks = false;
  while ((match = linkRegex.exec(content)) !== null) {
    const url = match[1];
    if (url.includes('http//') || url.includes('https//') || (!url.startsWith('http') && !url.startsWith('#') && !url.startsWith('/'))) {
      hasSuspiciousLinks = true;
      break;
    }
  }
  if (hasSuspiciousLinks) {
    items.push({ id: 'links', label: 'Link Validation', status: 'warn', details: 'Some links look suspicious (e.g. "http//" typo or broken protocol).' });
  } else {
    items.push({ id: 'links', label: 'Link Validation', status: 'ok', details: 'Standard links check passed.' });
  }

  // 7. Config check
  if (!plugin.settings.siteUrl || !plugin.settings.adminApiKey) {
    items.push({ id: 'config', label: 'Plugin Config', status: 'fail', details: 'Ghost URL or API Key missing in settings.' });
  }

  const isValid = !items.some(i => i.status === 'fail');
  const errors = items.filter(i => i.status === 'fail').map(i => i.details || i.label);

  return { isValid, items, errors };
}

// Keep backward compatibility for existing commands
export async function runChecks(plugin: GhostPublisherPlugin, file: TFile) {
  const results = await runDetailedChecks(plugin, file);
  return { isValid: results.isValid, errors: results.errors };
}
