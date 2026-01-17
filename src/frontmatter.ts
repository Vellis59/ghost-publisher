
import { TFile, App } from 'obsidian';

export interface GhostFrontmatter {
  title?: string;
  slug?: string;
  excerpt?: string;
  tags?: string[] | string;
  feature_image?: string;
  canonical_url?: string;
  visibility?: 'public' | 'members' | 'paid' | 'tiers';
  published_at?: string;
  status?: 'draft' | 'published';
  post_id?: string;
}

/**
 * Simple slugify helper: lowercase, remove accents, remove special chars, replace spaces with hyphens.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * Resolves title with fallback: ghost.title -> first H1 -> filename.
 */
async function resolveTitle(app: App, file: TFile, ghostTitle?: string): Promise<string> {
  if (ghostTitle && ghostTitle.trim().length > 0) return ghostTitle;

  const content = await app.vault.read(file);
  const h1Match = content.match(/^#\s+(.*)$/m);
  if (h1Match) return h1Match[1].trim();

  return file.basename;
}

/**
 * Extracts and maps metadata from Obsidian to Ghost format.
 */
export async function getGhostPayload(app: App, file: TFile) {
  const cache = app.metadataCache.getFileCache(file);
  const frontmatter = cache?.frontmatter || {};
  const ghost: GhostFrontmatter = frontmatter.ghost || {};

  const title = await resolveTitle(app, file, ghost.title);
  const slug = ghost.slug || slugify(title);

  // Normalize tags: ghost.tags -> frontmatter.tags -> []
  let tags = ghost.tags || frontmatter.tags || [];
  if (typeof tags === 'string') tags = [tags];

  // Map Ghost fields
  return {
    title,
    slug,
    excerpt: ghost.excerpt || frontmatter.excerpt || '',
    tags: (tags as string[]).map(t => ({ name: t })),
    feature_image: ghost.feature_image || null,
    canonical_url: ghost.canonical_url || null,
    visibility: ghost.visibility || 'public',
    published_at: ghost.published_at || null,
    status: ghost.status || 'draft',
    post_id: ghost.post_id || null,
  };
}

/**
 * Updates the frontmatter with Ghost's response data after publishing.
 */
export async function updateFrontmatterAfterPublish(app: App, file: TFile, postId: string, status: string) {
  await app.fileManager.processFrontMatter(file, (frontmatter) => {
    if (!frontmatter.ghost) {
      frontmatter.ghost = {};
    }
    frontmatter.ghost.post_id = postId;
    frontmatter.ghost.status = status;
  });
}
