# Redmark Forge Sandbox

A browser-first research workspace containing **14 independent destinations**: the original Steganography Studio plus 12 standalone experimental studios. Each studio owns its page, UI, state and JavaScript; navigation connects them without a shared tool runtime. The workspace remains separate from Omni Suite.

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
4. Paste the hosted URL into the caption helper in **Secure file share**, prepare/copy the message (the passphrase is deliberately omitted), and paste it into Instagram. Send the passphrase through a different channel.

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


## Independent studios

The sidebar links to three additional standalone tools, each implemented in its own HTML page with its own CSS and JavaScript. They do not import the Steganography Studio runtime or depend on a shared application state:

- **Digital Forensics Studio** (`forensics.html`): signature triage, entropy, SHA-256/SHA-384, hex viewer/search, printable strings, structural end-marker heuristics, multi-file CSV inventory, JSON report and byte comparison. Detailed in-memory analysis is capped at 128 MiB per file.
- **Error Correction Studio** (`error-correction.html`): Hamming (7,4), repetition ×3/×5/×7 and raw baselines; random/burst noise; BER and coding-rate metrics; CRC-32; bitstream inspection; Monte Carlo trials and BER sweeps.
- **Robustness Testing Studio** (`robustness.html`): local image resize/crop/rotate/blur/brightness/contrast/noise and PNG/JPEG/WebP encoding; MAE, PSNR and approximate SSIM; luminance histogram; fragile LSB probe survival; batch stress profiles and JSON/CSV reports.

### Studio isolation contract

Each studio owns its page, styles, controls, state and algorithms. No new studio imports or mutates another studio's JavaScript. Navigation links are the only integration point; each studio can be revised independently by editing its own HTML file. Keep shared shell/navigation changes separate from tool logic. All three run in the browser and do not upload evidence or images to a service. These are research/learning tools; output is heuristic and not a substitute for professional forensic workflows or actual social-platform testing.


## The 13 independent destinations

The original Steganography Studio remains intact as its own page. Twelve additional research studios are linked from the sidebar and have standalone HTML pages:

- **Digital Forensics Studio** (`forensics.html`): file signatures, entropy, SHA-256/SHA-384, hex viewer and search, printable strings, end-marker/trailing-data heuristics, multi-file CSV inventory, JSON reports and byte comparison.
- **Cryptography Lab** (`cryptography.html`): AES-256-GCM text/file encryption, PBKDF2-SHA-256 passphrase derivation, SHA-256/384/512, HMAC-SHA-256, secure random bytes, hex and Base64 conversion.
- **Image Forensics Studio** (`image-forensics.html`): dimensions, partial JPEG EXIF, SHA-256, RGB/luminance statistics, histogram, recompression-difference visualization and aligned pixel comparison.
- **Entropy & Information Studio** (`entropy-information.html`): Shannon entropy, frequency tables, information limits, redundancy, gzip size estimates, byte-bigram counts and first-order conditional entropy.
- **Audio Signal Studio** (`audio-signal.html`): browser audio decoding/playback, waveform/spectrum, peak/RMS/zero-crossing metrics, trim, normalization, PCM WAV export, tone generation and biquad filtering.
- **Protocol & Packet Lab** (`protocol-packet.html`): offline classic-PCAP Ethernet parser, IPv4/IPv6 and TCP/UDP/ICMP headers, DNS/HTTP indicators, filtering, packet details and CSV/JSON export. PCAPNG and live capture are not supported.
- **Visual Encoding Studio** (`visual-encoding.html`): RVE1 pixel-image payload encoding with length/CRC, recovery from compatible PNGs, red-channel bit-plane visualization and binary/hex/Base64/Morse/Braille representations.
- **Binary Diff Studio** (`binary-diff.html`): file hashes, exact equality, length delta, aligned byte differences, common prefix/suffix, changed ranges, hex windows and CSV/JSON reports.
- **Data Sonification Studio** (`data-sonification.html`): text/file to FSK audio WAV, compatible WAV decoding, byte-to-pitch melody generation and WAV metadata inspection.
- **File Format Explorer** (`file-format-explorer.html`): signature identification and parsers for PNG/JPEG/PDF/ZIP/RIFF/MP4/ELF/PE/SQLite and more, structure offsets, printable strings, hex slices and JSON reports.
- **Error Correction Studio** (`error-correction.html`): Hamming (7,4), repetition ×3/×5/×7, raw baseline, random/burst noise, BER, CRC-32, Monte Carlo and BER sweeps.
- **Robustness Testing Studio** (`robustness.html`): image transforms, PNG/JPEG/WebP output, MAE/PSNR/approximate SSIM, histograms, LSB probe recovery and batch stress profiles.

### Isolation contract

Every studio owns its HTML page, styles, controls, state and algorithms. The pages do not import or mutate another studio's JavaScript; navigation is the integration layer. A feature change should normally touch only that studio's page. The root sidebar and README are shared shell/documentation, so navigation or catalog edits may touch them without changing tool algorithms. Browser processing is the default; no tool uploads evidence to a service.

These tools are experimental. Signature and image-forensics indicators are heuristic; the packet parser is limited to classic Ethernet PCAP; audio codecs depend on browser support; FSK and pixel encodings can fail after transformations; cryptography relies on Web Crypto and strong passphrases. Review each studio's on-page limitations before using it for sensitive or high-stakes work.

## RedmarkShare — torrent-style P2P sharing

`redmarkshare.html` adds a browser-based peer-to-peer transfer page linked from the main sidebar. It uses WebTorrent/WebRTC-compatible peers, creates a magnet link and QR code when sending, and lets a receiver scan a QR code or paste the magnet link to join the swarm. Torrent pieces are verified by the torrent protocol, and downloaded files can be streamed to disk in browsers supporting the File System Access API.

- One selected file is shared as one torrent; chunking and reconstruction are handled by the torrent engine.
- QR is a handoff for the magnet link, not a storage mechanism.
- The sender's browser must remain open and keep the original file available while seeding.
- Browser WebTorrent peers communicate with WebRTC-compatible peers, not all ordinary TCP/UDP BitTorrent peers.
- Public WebSocket trackers are used for peer discovery; tracker availability and network/NAT conditions affect connectivity.
- Large-file disk saving requires a browser that supports `showSaveFilePicker` and enough free disk space. This page intentionally avoids a giant in-memory Blob fallback for very large files.
- This initial version does not guarantee resume after closing/reloading the page, and has not yet been validated with a real >10 GB end-to-end test. Treat it as an experimental implementation until tested across the target browsers and networks.
- The page loads WebTorrent and QR generation from third-party CDNs. A future production release should pin and self-host audited dependencies and verify tracker availability.



## OSINT Studio (browser-only)

`osint.html` adds a standalone OSINT workbench to the Sandbox navigation. It runs in the browser and does not require or use the Local Engine or a backend.

- Public search-query builder for general research, usernames, public documents, mentions and news, with links to search providers.
- Username search shortcuts for public/indexed web, Reddit, GitHub and YouTube results. These are search links, not automated platform scraping or identity verification.
- Best-effort public DNS-over-HTTPS and RDAP lookups from the browser, plus a public certificate-transparency search workflow through web search.
- Local URL structure inspection before opening a URL.
- Browser-local investigation cases and evidence notes with source URL, timestamps, evidence type and confidence; export to JSON, CSV and Markdown report.
- Links to the existing Image Forensics, Digital Forensics and File Format Explorer studios rather than duplicating their analysis tools.

### OSINT Studio limitations and privacy

This is a browser-only static application. Cross-origin policy, network filters, endpoint availability and provider rate limits can prevent external lookups. It does not scrape search results, bypass authentication, perform port scans, or guarantee attribution. Search results and correlations are leads, not proof. External providers receive queries when contacted or opened. Case notes use browser localStorage, are not encrypted, do not synchronize between devices, and may be cleared by the browser. Export important work and protect exported files. Use public sources lawfully and avoid collecting sensitive personal information without a legitimate basis.
