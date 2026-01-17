
import { App, Modal, Setting } from 'obsidian';

export class ScheduleModal extends Modal {
  result: string = "";
  onSubmit: (result: string) => void;

  constructor(app: App, onSubmit: (result: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    // Fix: Access contentEl via any cast to bypass missing property error
    const contentEl = (this as any).contentEl;
    contentEl.createEl('h2', { text: 'Schedule Post' });

    let dateInput: string = "";

    new Setting(contentEl)
      .setName('Publication Date & Time')
      .setDesc('Select when you want this post to be published.')
      .addText((text) => {
        text.inputEl.type = 'datetime-local';
        text.onChange((value) => {
          dateInput = value;
        });
      });

    new Setting(contentEl)
      .addButton((btn) =>
        btn
          .setButtonText('Schedule')
          .setCta()
          .onClick(() => {
            if (!dateInput) {
              return;
            }
            // Convert to ISO
            const date = new Date(dateInput);
            (this as any).close();
            this.onSubmit(date.toISOString());
          })
      );
  }

  onClose() {
    // Fix: Access contentEl via any cast to bypass missing property error
    const contentEl = (this as any).contentEl;
    contentEl.empty();
  }
}
