# Ghost Publisher for Obsidian

A high-performance Obsidian plugin to publish notes directly to Ghost CMS with full frontmatter support and pre-publish checks.

## 🚀 Installation (Development)

1. Clone this repository or copy the files into your vault's plugin directory: `.obsidian/plugins/ghost-publisher`.
2. Ensure you have [Node.js](https://nodejs.org/) installed.
3. Install dependencies:
   ```bash
   npm install
   ```

## 🛠 Building the Plugin

To compile the TypeScript source code into a usable Obsidian plugin:

- **Development Build:**
  ```bash
  npm run dev
  ```
- **Production Build:**
  ```bash
  npm run build
  ```

This generates `main.js` in the project root, which Obsidian requires to run the plugin.

## 📥 Loading the Plugin into Obsidian

1. Open Obsidian.
2. Go to `Settings` > `Community Plugins`.
3. Ensure "Community Plugins" is turned on.
4. If you copied the files correctly, "Ghost Publisher" should appear in the list of installed plugins.
5. Click the toggle to **Enable** it.

## 🐞 Debugging

To view logs and debug issues:
1. Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS) to open the Obsidian Developer Tools.
2. Go to the **Console** tab to see plugin logs and any error messages from the Ghost API.

## 🔒 Security Note

### API Key Storage
The **Admin API Key** is required to communicate with your Ghost site. 

- **If "Remember key" is enabled:** The key is stored locally within your Obsidian vault in `.obsidian/plugins/ghost-publisher/data.json`. Note that Obsidian stores this file in plain text. Ensure your vault directory is protected if you share your vault.
- **If "Remember key" is disabled:** The key is only kept in memory for the duration of your Obsidian session. You will need to re-enter it whenever Obsidian restarts.

The plugin uses **JWT (JSON Web Tokens)** signed locally to authenticate with Ghost; your secret key is never sent directly to Ghost's servers in its raw form, only the signed token is transmitted over HTTPS.

## ✅ Features

- **Multi-Status Publishing:** Publish as Draft, Publish Now, or Schedule for the future.
- **Smart Mapping:** Automatically resolves titles from Frontmatter, H1 headers, or filenames.
- **Pre-publish Checks:** Interactive panel to validate your content before it goes live.
- **Frontmatter Write-back:** Automatically saves the Ghost Post ID and Status back to your note for easy updates.
