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

## 🐞 How to test & what to report (BRAT)

This plugin is currently distributed as a beta via BRAT. If you want to help testing, follow the steps below and report results in GitHub Issues.

### Install via BRAT

1. In Obsidian: Settings → Community plugins → Browse
2. Install and enable: Obsidian42 - BRAT
3. Open the Command Palette:
   - BRAT: Add a beta plugin for testing
4. Paste this repo URL:
   - https://github.com/Vellis59/ghost-publisher
5. Confirm, then go back to:
   - Settings → Community plugins → enable "Ghost Publisher"

Optional but recommended:
- Command Palette → BRAT: Check for updates (to pull the latest release)

### Quick smoke test checklist (2–3 minutes)

Please try at least:

- Plugin loads without error (no crash at Obsidian startup)
- Plugin settings page is visible (Settings → Ghost Publisher)
- Main actions are available (command palette / ribbon / buttons — depending on your setup)
- Try one real workflow end-to-end:
  - Configure connection
  - Publish / update (or whatever the plugin supports in this version)
  - Confirm expected result on the Ghost side

### How to capture logs (very important)

If something fails, please include console logs.

Desktop (Windows / macOS / Linux):
1. Open Developer Tools:
   - Windows/Linux: Ctrl+Shift+I
   - macOS: Cmd+Option+I
2. Go to the Console tab
3. Copy/paste the errors related to Ghost Publisher

If you can, also add:
- A screenshot of the plugin settings page
- Steps to reproduce (what you clicked, in what order)

### What to report in GitHub Issues

When opening an issue, please include:

- Plugin version (from manifest.json or release tag)
- Obsidian version
- OS (Windows/macOS/Linux) and whether you're using Obsidian Sync
- Your Ghost setup (Ghost(Pro) / self-hosted) + Ghost version if known
- Exact steps to reproduce
- Expected vs actual result
- Console logs

Security note:
- Do NOT paste your Ghost Admin API key, token, password, or any secret.
- If a log includes a secret, redact it before posting.

Thanks for testing. You are officially part of the "things that save me hours later" squad.

## ✅ Features

- **Multi-Status Publishing:** Publish as Draft, Publish Now, or Schedule for the future.
- **Smart Mapping:** Automatically resolves titles from Frontmatter, H1 headers, or filenames.
- **Pre-publish Checks:** Interactive panel to validate your content before it goes live.
- **Frontmatter Write-back:** Automatically saves the Ghost Post ID and Status back to your note for easy updates.
