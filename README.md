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
- **Keyed multi-bit LSB, LSB analyzer, WAV LSB, hidden-data hunter, variation-selector text and Shamir secret sharing** (see the catalog below).
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


## The independent destinations

The Steganography Studio and RedmarkShare are standalone pages, and twelve research studios are linked from the sidebar. Each has its own HTML page. Every studio keeps its original tools and adds the following.

- **Steganography Studio** (`index.html`): the original PNG LSB, appended-payload, zero-width, metadata, watermark, Secure File Share and Social Signal tools, plus:
  - **Keyed LSB:** any image to lossless PNG, 1–4 bits per channel, channel selection, optional AES-GCM encryption and a passphrase-keyed pixel scatter. Extraction auto-detects the settings.
  - **LSB analyzer:** bit-plane viewer, RS analysis and chi-square pairs-of-values test, cover-versus-stego PSNR and difference map, and a raw bit extractor with a zsteg-style auto-scan.
  - **Audio LSB:** hide data in 8/16/24-bit PCM WAV, with SNR reporting.
  - **Hidden-data hunter:** trailing data and embedded signatures in PNG/JPEG/GIF/ZIP/PDF; hide and reveal payloads in a private PNG chunk, JPEG comments or a ZIP comment.
  - **Variation-selector text** hiding, with an invisible-character audit.
  - **Shamir K-of-N** secret sharing.
- **Digital Forensics Studio** (`forensics.html`): signature triage, entropy and entropy map, hashes, hex viewer and search, strings, end-marker checks, file carving, IOC extractor, XOR probe, multi-hash lab, multi-file inventory, byte comparison and case report.
- **Cryptography Lab** (`cryptography.html`): AES-256-GCM, PBKDF2/HKDF/scrypt, passphrase generator and strength, RSA/ECDSA/ECDH/Ed25519 with PEM and hybrid file encryption, MD5/SHA-1/SHA-2/SHA-3/CRC, encodings, classical ciphers, TOTP, JWT and X.509/ASN.1 inspectors, Shamir sharing and an AES mode/tamper lab.
- **Image Forensics Studio** (`image-forensics.html`): metadata and JPEG quality estimation, error-level analysis, noise-consistency map, bit-plane viewer with LSB chi-square steganalysis, copy-move detector, SSIM/PSNR/perceptual-hash similarity.
- **Entropy & Information Studio** (`entropy-information.html`): Shannon entropy and frequency tables, a randomness test battery, context-order models, Huffman lab, divergence and language identification, and an information calculator.
- **Audio Signal Studio** (`audio-signal.html`): playback, waveform and spectrum, spectrogram, EBU R128 loudness with true peak, YIN pitch, WAV LSB steganalysis and embedding, effects chain with undo, generators, DTMF/FSK/Morse encode and decode.
- **Protocol & Packet Lab** (`protocol-packet.html`): classic PCAP and PCAPNG reading, layered dissection (Ethernet/VLAN/ARP/IPv4/IPv6/TCP/UDP/ICMP/DNS/DHCP/NTP/TLS/HTTP and cleartext mail/FTP), checksum verification, conversations, security findings, application-layer views, TCP stream following with HTTP object extraction, a packet builder with PCAP writer, and a hex dissector.
- **Visual Encoding Studio** (`visual-encoding.html`): RVE1 pixel payloads, QR encoder and reader with damage test, EAN/UPC/ISBN barcodes, colour-grid codec, identicon/randomart, invisible-text steganography and audit, a magic decoder, 1-bit/ASCII/Braille art and a raw pixel byte reader.
- **Binary Diff Studio** (`binary-diff.html`): hashes, equality, insert/delete-aware edit script, verifiable binary patches, bit-level change analysis, changed ranges, hex windows, text line diff and CSV/JSON reports.
- **Data Sonification Studio** (`data-sonification.html`): a modem test bench (BFSK/4-FSK/DBPSK with CRC-32, FEC and a channel simulator), series sonifier, picture/text to spectrogram sound, RIFF chunk inspector and file listening.
- **File Format Explorer** (`file-format-explorer.html`): deep decoders for PNG, JPEG with EXIF, GIF, ZIP, PDF, WAV, MP4, ELF, PE and SQLite, CRC validation, anomaly findings and a coverage map.
- **Error Correction Studio** (`error-correction.html`): Reed–Solomon lab with file protect and repair, convolutional/Viterbi shootout, interleaving versus bursts, CRC/checksum lab, SECDED extended Hamming, plus the original Hamming/repetition tools and Monte Carlo sweeps.
- **Robustness Testing Studio** (`robustness.html`): image transforms and re-encoding, quality metrics, a fragile-versus-robust embedding matrix (LSB against keyed spread spectrum across 23 transforms), watermark detector, quality sweep and two-image diff.

### Isolation contract

Every studio owns its HTML page, styles, controls, state and algorithms. The pages do not import or mutate another studio's JavaScript; navigation is the integration layer. A feature change should normally touch only that studio's page. The root sidebar and README are shared shell and documentation, so navigation or catalog edits may touch them without changing tool algorithms. Browser processing is the default; no tool uploads evidence to a service.

These tools are experimental. Signature, steganalysis and image-forensics indicators are heuristic; the packet findings are leads, not verdicts; audio codecs depend on browser support; FSK, pixel and LSB encodings fail after lossy transformations; cryptography relies on Web Crypto and strong passphrases. Review each studio's on-page limitations before using it for sensitive or high-stakes work.

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
- **Torrent toolkit (offline):** creates standard v1 .torrent files and magnet links, inspects any .torrent or magnet, and verifies downloaded files piece by piece against a .torrent. These parts do not need WebTorrent or a network.
- **Pack & hash:** bundles several files into a stored ZIP, and computes streaming SHA-256 and CRC-32 to compare with the sender's hash.
- **Connection check:** reports host/STUN/TURN candidate types and measures local WebRTC throughput.

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
