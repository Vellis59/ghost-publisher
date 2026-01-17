
import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import GhostPublisherPlugin from './main';
import { getErrorMessage } from './ghost/errors';

export interface GhostPublisherSettings {
  siteUrl: string;
  adminApiKey: string;
  rememberKey: boolean;
}

export const DEFAULT_SETTINGS: GhostPublisherSettings = {
  siteUrl: '',
  adminApiKey: '',
  rememberKey: true,
};

export class GhostPublisherSettingTab extends PluginSettingTab {
  plugin: GhostPublisherPlugin;

  constructor(app: App, plugin: GhostPublisherPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    // Fix: Access containerEl via any cast to bypass missing property error
    const containerEl = (this as any).containerEl;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Ghost Publisher Settings' });

    new Setting(containerEl)
      .setName('Ghost Site URL')
      .setDesc('Example: https://your-blog.ghost.io')
      .addText((text) =>
        text
          .setPlaceholder('https://...')
          .setValue(this.plugin.settings.siteUrl)
          .onChange(async (value) => {
            this.plugin.settings.siteUrl = value.replace(/\/$/, '');
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Admin API Key')
      .setDesc('Retrieved from Ghost Integrations page.')
      .addText((text) => {
        text.inputEl.type = 'password';
        text
          .setPlaceholder('ID:SECRET')
          .setValue(this.plugin.settings.adminApiKey)
          .onChange(async (value) => {
            this.plugin.settings.adminApiKey = value;
            if (this.plugin.settings.rememberKey) {
                await this.plugin.saveSettings();
            }
          });
      });

    new Setting(containerEl)
      .setName('Remember key')
      .setDesc('If disabled, the key is only stored in memory for the session.')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.rememberKey)
          .onChange(async (value) => {
            this.plugin.settings.rememberKey = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Test Connection')
      .setDesc('Verify that your URL and API Key are valid.')
      .addButton((btn) =>
        btn.setButtonText('Test Connection').onClick(async () => {
          btn.setDisabled(true);
          btn.setButtonText('Testing...');
          
          try {
            const success = await this.plugin.ghostClient.testConnection();
            if (success) {
              new Notice('Ghost Connection Successful!');
            } else {
              new Notice('Ghost Connection Failed. Check console for details.');
            }
          } catch (e: unknown) {
            new Notice(`Error: ${getErrorMessage(e)}`);
          } finally {
            btn.setDisabled(false);
            btn.setButtonText('Test Connection');
          }
        })
      );
  }
}
