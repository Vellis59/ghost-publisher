
import { Notice } from 'obsidian';
import GhostPublisherPlugin from './main';
import { getGhostPayload, updateFrontmatterAfterPublish } from './frontmatter';
import { runChecks } from './checks';
import { ScheduleModal } from './ui/ScheduleModal';
import { getErrorMessage } from './ghost/errors';

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
        // Fix: Access app via any cast to bypass missing property error
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
    // Fix: Access app via any cast to bypass missing property error
    const activeFile = (this.plugin as any).app.workspace.getActiveFile();
    if (!activeFile) return;

    const checkResults = await runChecks(this.plugin, activeFile);
    if (!checkResults.isValid) {
      this.showActionableError(checkResults.errors.join('. '));
      return;
    }

    try {
      // Fix: Access app via any cast to bypass missing property error
      const content = await (this.plugin as any).app.vault.read(activeFile);
      // Fix: Access app via any cast to bypass missing property error
      const payload = await getGhostPayload((this.plugin as any).app, activeFile);
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
        html: `<div class="kg-card kg-markdown-card">${cleanContent}</div>`,
      };

      if (status === 'scheduled' && publishedAt) {
        ghostData.published_at = publishedAt;
      }

      new Notice(`Publishing to Ghost as ${status}...`);
      
      let result;
      if (payload.post_id) {
        result = await this.plugin.ghostClient.updatePost(payload.post_id, ghostData);
      } else {
        result = await this.plugin.ghostClient.createPost(ghostData);
      }

      // Fix: Access app via any cast to bypass missing property error
      await updateFrontmatterAfterPublish((this.plugin as any).app, activeFile, result.id, result.status);
      new Notice(`Success: Post is now ${result.status}`);

    } catch (e: unknown) {
      this.showActionableError(getErrorMessage(e));
    }
  }

  async handleUpdate() {
    // Fix: Access app via any cast to bypass missing property error
    const activeFile = (this.plugin as any).app.workspace.getActiveFile();
    if (!activeFile) return;

    // Fix: Access app via any cast to bypass missing property error
    const payload = await getGhostPayload((this.plugin as any).app, activeFile);
    if (!payload.post_id) {
      new Notice('Error: This note has no ghost.post_id. Use "Publish" commands first.');
      return;
    }

    try {
      // Fix: Access app via any cast to bypass missing property error
      const content = await (this.plugin as any).app.vault.read(activeFile);
      const cleanContent = content.replace(/^---[\s\S]*?---/, '').trim();

      const ghostData = {
        title: payload.title,
        slug: payload.slug,
        status: payload.status,
        excerpt: payload.excerpt,
        tags: payload.tags,
        feature_image: payload.feature_image,
        canonical_url: payload.canonical_url,
        visibility: payload.visibility,
        published_at: payload.published_at,
        html: `<div class="kg-card kg-markdown-card">${cleanContent}</div>`,
      };

      new Notice('Updating Ghost post...');
      const result = await this.plugin.ghostClient.updatePost(payload.post_id, ghostData);
      
      // Fix: Access app via any cast to bypass missing property error
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
