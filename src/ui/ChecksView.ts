
import { ItemView, WorkspaceLeaf, setIcon } from 'obsidian';
import GhostPublisherPlugin from '../main';
import { runDetailedChecks, CheckItem } from '../checks';

export const GHOST_CHECKS_VIEW_TYPE = 'ghost-checks-view';

export class ChecksView extends ItemView {
  plugin: GhostPublisherPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: GhostPublisherPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return GHOST_CHECKS_VIEW_TYPE;
  }

  getDisplayText(): string {
    return 'Ghost Publisher Checks';
  }

  getIcon(): string {
    return 'clipboard-check';
  }

  async onOpen() {
    this.update();
  }

  async update() {
    // Cast container to any to access Obsidian's augmented HTMLElement methods (empty, addClass, etc.)
    const container = (this as any).containerEl.children[1] as any;
    container.empty();
    container.addClass('ghost-checks-container');

    // Fix: Access app via any cast to bypass missing property error
    const activeFile = (this.plugin as any).app.workspace.getActiveFile();

    const header = container.createDiv({ cls: 'ghost-checks-header' });
    header.createEl('h4', { text: 'Pre-publish Checks' });
    
    const refreshBtn = header.createEl('button', { text: 'Re-run checks', cls: 'mod-cta' });
    refreshBtn.onclick = () => this.update();

    if (!activeFile) {
      container.createEl('p', { text: 'Open a markdown file to see checks.', cls: 'ghost-checks-empty' });
      return;
    }

    container.createEl('p', { text: `File: ${activeFile.name}`, cls: 'ghost-checks-file-info' });

    const results = await runDetailedChecks(this.plugin, activeFile);
    const list = container.createDiv({ cls: 'ghost-checks-list' });

    results.items.forEach((item: CheckItem) => {
      const itemEl = list.createDiv({ cls: `ghost-check-item status-${item.status}` });
      
      const iconEl = itemEl.createSpan({ cls: 'ghost-check-icon' });
      if (item.status === 'ok') setIcon(iconEl, 'check-circle');
      else if (item.status === 'warn') setIcon(iconEl, 'alert-triangle');
      else if (item.status === 'fail') setIcon(iconEl, 'x-circle');

      const textWrapper = itemEl.createDiv({ cls: 'ghost-check-text' });
      textWrapper.createDiv({ cls: 'ghost-check-label', text: item.label });
      if (item.details) {
        textWrapper.createDiv({ cls: 'ghost-check-details', text: item.details });
      }
    });

    if (results.isValid) {
      container.createDiv({ cls: 'ghost-checks-summary success', text: 'All critical checks passed! Ready to publish.' });
    } else {
      container.createDiv({ cls: 'ghost-checks-summary failure', text: 'Fix critical issues before publishing.' });
    }
  }
}
