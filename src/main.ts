
import { Plugin, WorkspaceLeaf } from 'obsidian';
import { GhostPublisherSettings, DEFAULT_SETTINGS, GhostPublisherSettingTab } from './settings';
import { GhostClient } from './ghost/GhostClient';
import { GhostCommands } from './commands';
import { ChecksView, GHOST_CHECKS_VIEW_TYPE } from './ui/ChecksView';

export default class GhostPublisherPlugin extends Plugin {
  // Use ! to tell TS these will be initialized in onload
  settings!: GhostPublisherSettings;
  ghostClient!: GhostClient;

  async onload() {
    await this.loadSettings();

    // Initialize client after settings are loaded
    this.ghostClient = new GhostClient(this);

    // Register View
    (this as any).registerView(
      GHOST_CHECKS_VIEW_TYPE,
      (leaf: WorkspaceLeaf) => new ChecksView(leaf, this)
    );

    // Add settings tab
    // Fix: Access app via any cast to bypass missing property error
    (this as any).addSettingTab(new GhostPublisherSettingTab((this as any).app, this));

    // Register commands
    const commands = new GhostCommands(this);
    commands.register();

    // Auto-update view on file change
    // Fix: Access app via any cast to bypass missing property error
    (this as any).registerEvent(
      (this as any).app.workspace.on('file-open', () => {
        this.updateChecksView();
      })
    );

    console.log('Ghost Publisher loaded');
  }

  onunload() {
    console.log('Ghost Publisher unloaded');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await (this as any).loadData());
  }

  async saveSettings() {
    await (this as any).saveData(this.settings);
  }

  private updateChecksView() {
    // Fix: Access app via any cast to bypass missing property error
    const leaves = (this as any).app.workspace.getLeavesOfType(GHOST_CHECKS_VIEW_TYPE);
    leaves.forEach((leaf: WorkspaceLeaf) => {
      const view = leaf.view as ChecksView;
      if (view instanceof ChecksView) {
        view.update();
      }
    });
  }

  async activateView() {
    // Fix: Access app via any cast to bypass missing property error
    const { workspace } = (this as any).app;
    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(GHOST_CHECKS_VIEW_TYPE);

    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({ type: GHOST_CHECKS_VIEW_TYPE, active: true });
      }
    }

    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }
}
