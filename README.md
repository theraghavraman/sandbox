# Redmark Forge Sandbox

A browser-first, single-studio workspace for steganography experiments. The sidebar intentionally contains only **Steganography Studio**, styled to match the Redmark Forge studio shell.

## Features

- **PNG LSB encode/decode** for a binary payload, with capacity checks and optional AES-GCM encryption (PBKDF2-derived key).
- **Universal appended payload container** for arbitrary carrier and payload file types, with an explicit footer marker and optional encryption. This is detectable and may affect file compatibility.
- **Zero-width Unicode text hiding** and decoding.
- **Metadata / structure inspector** with basic signatures and SHA-256.
- **Visible image watermarking**.
- Browser-local processing; no app backend or file upload endpoint.
- Responsive layout and a one-item sidebar.

## Important limitations

- Instagram and other social services may resize, recompress, crop or strip content. PNG LSB payloads and zero-width text are fragile; recovery is not guaranteed.
- Appended payload mode is not invisible, may break file readers, and can be stripped by other software.
- The metadata inspector is intentionally basic; it is not a complete EXIF/XMP/PDF/Office forensic parser.
- Visible watermarking is not robust invisible DCT watermarking. DCT-based robust watermarking is not implemented in this version and must not be presented as supported.
- Encryption requires a modern browser with Web Crypto. Use HTTPS (GitHub Pages qualifies) or localhost.
- Use only on files you own or are authorized to modify. This tool is not intended for malware concealment or evasion.

## Deploy

This repository includes a GitHub Actions workflow that publishes the static site to GitHub Pages. In GitHub, open **Settings → Pages** and select **GitHub Actions** as the source if it is not already selected.

## Local run

Open `index.html` directly for most features. Some browser APIs, especially Web Crypto and clipboard access, work only on HTTPS or localhost.
