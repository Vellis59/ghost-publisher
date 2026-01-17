import { Notice } from 'obsidian';
import GhostPublisherPlugin from './main';
import { getGhostPayload, updateFrontmatterAfterPublish } from './frontmatter';
import { runChecks } from './checks';
import { ScheduleModal } from './ui/ScheduleModal';
import { getErrorMessage } from './ghost/errors';
import { createMarkdownMobiledoc } from './ghost/mobiledoc';

export class GhostCommands {
  plugin: GhostPublisherPlugin;

  constructor(plugin: GhostPublisherPlugin) {
    this.plugin = plugin;
  }

  register() {
    const plugin = this.plugin as any;

    // 1. Publish as Draft
    plugin.addCommand({
      id: 'ghost-publish-draft',
      name: 'Publish to Ghost as Draft',
      callback: () => this.handlePublish('draft')
    });

    // 2. Publish Now
    plugin.addCommand({
      id: 'ghost-publish-now',
      name: 'Publish to Ghost Now',
      callback: () => this.handlePublish('published')
    });

    // 3. Schedule
    plugin.addCommand({
      id: 'ghost-publish-schedule',
      name: 'Schedule Ghost Post',
      callback: () => {
        (new ScheduleModal((this.plugin as any).app, (isoDate) => {
          this.handlePublish('scheduled', isoDate);
        }) as any).open();
      }
    });

    // 4. Update Existing
    plugin.addCommand({
      id: 'ghost-update-post',
      name: 'Update existing Ghost post',
      callback: () => this.handleUpdate()
    });

    // 5. Open Checks View
    plugin.addCommand({
      id: 'ghost-open-checks',
      name: 'Show pre-publish checks panel',
      callback: () => this.plugin.activateView()
    });
  }

  async handlePublish(status: 'draft' | 'published' | 'scheduled', publishedAt?: string) {
    const activeFile = (this.plugin as any).app.workspace.getActiveFile();
    if (!activeFile) return;

    const checkResults = await runChecks(this.plugin, activeFile);
    if (!checkResults.isValid) {
      this.showActionableError(checkResults.errors.join('. '));
      return;
    }

    try {
      const content = await (this.plugin as any).app.vault.read(activeFile);
      const payload = await getGhostPayload((this.plugin as any).app, activeFile);
      // Regex correctly excludes Obsidian frontmatter
      const cleanContent = content.replace(/^---[\s\S]*?---/, '').trim();

      const ghostData: any = {
        title: payload.title,
        slug: payload.slug,
        status: status,
        excerpt: payload.excerpt,
        tags: payload.tags,
        feature_image: payload.feature_image,
        canonical_url: payload.canonical_url,
        visibility: payload.visibility,
        // Using mobiledoc ensures Ghost renders the Markdown card correctly
        mobiledoc: createMarkdownMobiledoc(cleanContent),
      };

      if (status === 'scheduled' && publishedAt) {
        ghostData.published_at = publishedAt;
      }

      if (this.plugin.settings.debugMode) {
        console.log('Ghost Publisher [Debug] Payload:', ghostData);
        new Notice('Check console (Ctrl+Shift+I) for payload preview.');
      }

      new Notice(`Publishing to Ghost as ${status}...`);
      
      let result;
      if (payload.post_id) {
        result = await this.plugin.ghostClient.updatePost(payload.post_id, ghostData);
      } else {
        result = await this.plugin.ghostClient.createPost(ghostData);
      }

      await updateFrontmatterAfterPublish((this.plugin as any).app, activeFile, result.id, result.status);
      new Notice(`Success: Post is now ${result.status}`);

    } catch (e: unknown) {
      this.showActionableError(getErrorMessage(e));
    }
  }

  async handleUpdate() {
    const activeFile = (this.plugin as any).app.workspace.getActiveFile();
    if (!activeFile) return;

    const payload = await getGhostPayload((this.plugin as any).app, activeFile);
    if (!payload.post_id) {
      new Notice('Error: This note has no ghost.post_id. Use "Publish" commands first.');
      return;
    }

    try {
      const content = await (this.plugin as any).app.vault.read(activeFile);
      const cleanContent = content.replace(/^---[\s\S]*?---/, '').trim();

      const ghostData: any = {
        title: payload.title,
        slug: payload.slug,
        status: payload.status,
        excerpt: payload.excerpt,
        tags: payload.tags,
        feature_image: payload.feature_image,
        canonical_url: payload.canonical_url,
        visibility: payload.visibility,
        published_at: payload.published_at,
        mobiledoc: createMarkdownMobiledoc(cleanContent),
      };

      if (this.plugin.settings.debugMode) {
        console.log('Ghost Publisher [Debug] Update Payload:', ghostData);
        new Notice('Check console (Ctrl+Shift+I) for payload preview.');
      }

      new Notice('Updating Ghost post...');
      const result = await this.plugin.ghostClient.updatePost(payload.post_id, ghostData);
      
      await updateFrontmatterAfterPublish((this.plugin as any).app, activeFile, result.id, result.status);
      new Notice(`Successfully updated: ${result.title}`);

    } catch (e: unknown) {
      this.showActionableError(getErrorMessage(e));
    }
  }

  private showActionableError(rawMessage: string) {
    let actionableMsg = rawMessage;

    if (rawMessage.includes('401') || rawMessage.includes('403')) {
      actionableMsg = "Authentication Failed: Please check if your Admin API Key is valid and has correct permissions.";
    } else if (rawMessage.includes('404')) {
      actionableMsg = "Not Found: Check if your Ghost Site URL is correct or if the Post ID still exists.";
    } else if (rawMessage.includes('ENOTFOUND') || rawMessage.includes('fetch')) {
      actionableMsg = "Network Error: Could not reach the Ghost server. Check your URL and internet connection.";
    }

    new Notice(`Ghost Publisher Error: ${actionableMsg}`, 8000);
    console.error('Ghost Publisher Detailed Error:', rawMessage);
  }
}
