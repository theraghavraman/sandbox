# Redmark Forge Sandbox

A browser-first, single-studio workspace for steganography experiments. The sidebar intentionally contains only **Steganography Studio**, styled to match the Redmark Forge studio shell.

## Features

- **Secure File Share:** encrypts a complete file as a standalone **.rfsafe** package using AES-GCM and a PBKDF2-derived key. Filenames and MIME types are stored inside the encrypted plaintext, not exposed in the package header.
- **Byte-preserving sharing workflow:** download the encrypted package, upload it yourself to Google Drive, Dropbox, or WeTransfer, share that hosted link on Instagram, and send the passphrase via a separate channel. The site does not upload files or create external share links.
- **Experimental Social Signal:** embeds a short UTF-8 message, URL, or key into 8×8 image-block frequency coefficients. Repeated bits and majority voting add redundancy; CRC-32 detects unrecovered errors. Optional AES-GCM encryption can protect the short message.
- **PNG LSB encode/decode** for binary payloads, with capacity checks and optional AES-GCM encryption.
- **Universal appended payload container** for arbitrary carrier and payload file types, with an explicit footer marker and optional encryption. This is detectable and may affect file compatibility.
- **Zero-width Unicode text hiding** and decoding.
- **Metadata / structure inspector** with basic signatures and SHA-256.
- **Visible image watermarking**.
- Browser-local processing; no app backend or file upload endpoint.
- Responsive layout and a one-item sidebar.

## Two different workflows

### 1. Sharing a complete encrypted file (recommended)

1. Open **Secure file share**, choose any file, and enter a strong unique passphrase.
2. Select **Encrypt complete file** and keep the downloaded .rfsafe package unchanged.
3. Upload that package to a host that preserves the bytes, such as Drive, Dropbox, or WeTransfer. Check its access permissions and test-download the package.
4. Put the hosted link in Instagram. Send the passphrase through a different channel.

To recover the file, select the downloaded .rfsafe package in the same tool and choose **Decrypt .rfsafe package**. Losing the passphrase means the app cannot recover the original file. Store it safely.

### 2. Embedding a short link/key in an image (experimental)

**Social Signal** is a research prototype, not a promise of Instagram compatibility. It embeds bits by manipulating the difference between two block-DCT coefficients, spreads the bits with a deterministic block order, repeats header bits nine times and body bits five times, then applies majority voting and a CRC-32 check. This can tolerate some bit errors, but it cannot guarantee recovery after arbitrary transforms.

To test: embed a short message, post the downloaded PNG to Instagram, download the actual image served by Instagram, select that processed image, and extract. A successful local encode/decode self-check validates only the local codec. **This repository has not been verified against Instagram's current output; resizing, cropping, filters, re-encoding or altered 8×8 block alignment may defeat extraction.** Do not rely on it for critical secrets or access credentials until tested end to end on the platform and app versions you use.

## Important limitations and security notes

- Instagram and other social services may resize, recompress, crop or strip content. PNG LSB data and zero-width text are fragile. Experimental Social Signal is not validated against actual Instagram output and may fail.
- Steganography is not encryption. Use optional payload encryption where available; for complete-file sharing, use **Secure file share**.
- Appended payload mode is not invisible, may break file readers, and can be stripped by other software.
- The metadata inspector is intentionally basic; it is not a complete EXIF/XMP/PDF/Office forensic parser.
- Visible watermarking is not robust invisible DCT watermarking. Social Signal is a short-text experimental carrier and is not a general-purpose robust watermark.
- Encryption requires a modern browser with Web Crypto. Use HTTPS (GitHub Pages qualifies) or localhost.
- The app runs locally in the browser. It does not upload your files to these hosts; you must initiate the upload yourself.
- Use only on files you own or are authorized to modify. This tool is not intended for malware concealment or evasion.

## Deploy

This repository includes a GitHub Actions workflow that publishes the static site to GitHub Pages. In GitHub, open **Settings → Pages** and select **GitHub Actions** as the source if it is not already selected.

## Local run

Open **index.html** directly for most features. Some browser APIs, especially Web Crypto and clipboard access, work only on HTTPS or localhost.
