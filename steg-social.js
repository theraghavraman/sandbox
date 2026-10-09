(() => {
'use strict';
const $ = id => document.getElementById(id);
const enc = new TextEncoder(), dec = new TextDecoder();
const setStatus = (message, kind) => {
  const node = $('mainStatus'); node.textContent = message;
  node.className = 'status' + (kind ? ' ' + kind : '');
  $('metricResult').textContent = kind === 'error' ? 'Error' : kind === 'ok' ? 'Success' : 'Ready';
};
const fmt = n => {
  if (!Number.isFinite(n)) return '—';
  const units = ['B','KB','MB','GB']; let i = 0;
  while (n >= 1024 && i < 3) { n /= 1024; i++; }
  return (n < 10 && i ? n.toFixed(1) : Math.round(n)) + ' ' + units[i];
};
const join = (...parts) => {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0; for (const part of parts) { out.set(part, offset); offset += part.length; }
  return out;
};
const u32 = n => new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
const readU32 = (a, p) => ((a[p] << 24) | (a[p+1] << 16) | (a[p+2] << 8) | a[p+3]) >>> 0;
const hasMagic = (bytes, magic) => {
  const m = enc.encode(magic);
  return bytes.length >= m.length && m.every((v, i) => bytes[i] === v);
};
const save = (blob, name) => {
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};
const updateFileMetrics = (file, label) => {
  if (!file) return;
  $('metricName').textContent = file.name; $('metricSize').textContent = fmt(file.size);
  $('metricMethod').textContent = label;
  const preview = $('preview');
  if (file.type && file.type.startsWith('image/')) {
    const img = document.createElement('img'); img.alt = 'Selected image preview';
    img.src = URL.createObjectURL(file); preview.replaceChildren(img);
  } else {
    const box = document.createElement('div'), strong = document.createElement('strong'), small = document.createElement('small');
    strong.textContent = file.name; small.textContent = (file.type || 'Unknown MIME type') + ' · ' + fmt(file.size);
    box.append(strong, document.createElement('br'), small); preview.replaceChildren(box);
  }
};

async function deriveAesKey(password, salt, usages) {
  if (!crypto.subtle) throw new Error('Web Crypto is unavailable. Open the GitHub Pages site over HTTPS or use localhost.');
  const material = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:210000,hash:'SHA-256'}, material,
    {name:'AES-GCM',length:256}, false, usages);
}
async function seal(bytes, password, marker) {
  if (!password || password.length < 10) throw new Error('Enter a passphrase with at least 10 characters (14+ is recommended).');
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(password, salt, ['encrypt']);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv}, key, bytes));
  return join(enc.encode(marker), salt, iv, cipher);
}
async function unseal(bytes, password, marker) {
  const mark = enc.encode(marker);
  if (bytes.length < mark.length + 16 + 12 + 16 || !hasMagic(bytes, marker)) throw new Error('This does not look like a complete ' + marker + ' encrypted package.');
  if (!password) throw new Error('Enter the passphrase used during encryption.');
  const salt = bytes.slice(5,21), iv = bytes.slice(21,33), cipher = bytes.slice(33);
  const key = await deriveAesKey(password, salt, ['decrypt']);
  try { return new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv}, key, cipher)); }
  catch { throw new Error('Decryption failed. Check the passphrase or package integrity.'); }
}

// Complete-file encryption: independent of an image/carrier, with authenticated AES-GCM.
$('secureEncrypt').addEventListener('click', async () => {
  try {
    const file = $('secureFile').files[0], password = $('securePassword').value;
    if (!file) throw new Error('Choose the complete source file first.');
    setStatus('Encrypting complete file locally…');
    const original = new Uint8Array(await file.arrayBuffer());
    const meta = enc.encode(JSON.stringify({name:file.name, type:file.type || 'application/octet-stream'}));
    const plain = join(u32(meta.length), meta, original);
    const packageBytes = await seal(plain, password, 'RFSF1');
    const outName = file.name.replace(/[\\/]+/g, '_') + '.rfsafe';
    save(new Blob([packageBytes], {type:'application/octet-stream'}), outName);
    updateFileMetrics(new File([packageBytes], outName, {type:'application/octet-stream'}), 'Secure file share');
    setStatus('Encrypted complete file downloaded as ' + outName + '. Upload this exact package to Drive, Dropbox or WeTransfer, then share its link on Instagram and send the passphrase separately.', 'ok');
  } catch (error) { setStatus(error.message || 'File encryption failed.', 'error'); }
});
$('secureDecrypt').addEventListener('click', async () => {
  try {
    const file = $('secureFile').files[0], password = $('securePassword').value;
    if (!file) throw new Error('Choose the .rfsafe package first.');
    setStatus('Decrypting package locally…');
    const packageBytes = new Uint8Array(await file.arrayBuffer());
    const plain = await unseal(packageBytes, password, 'RFSF1');
    if (plain.length < 4) throw new Error('Encrypted package is incomplete.');
    const metaLength = readU32(plain, 0);
    if (metaLength > plain.length - 4 || metaLength > 65536) throw new Error('Package metadata length is invalid.');
    let meta;
    try { meta = JSON.parse(dec.decode(plain.slice(4, 4 + metaLength))); }
    catch { throw new Error('Package metadata could not be read.'); }
    const name = String(meta.name || 'recovered-file.bin').split(/[\\/]/).pop().replace(/[\u0000-\u001f]/g, '_').slice(0,180) || 'recovered-file.bin';
    const mime = typeof meta.type === 'string' && meta.type.length < 200 ? meta.type : 'application/octet-stream';
    const content = plain.slice(4 + metaLength);
    save(new Blob([content], {type:mime}), name);
    setStatus('Decryption succeeded. Recovered ' + name + ' (' + fmt(content.length) + '). Verify the file before relying on it.', 'ok');
  } catch (error) { setStatus(error.message || 'Package decryption failed.', 'error'); }
});

// Experimental Social Signal. Block-DCT coefficient modulation plus repeated bits, majority vote and CRC-32.
// This tolerates some bit errors but cannot guarantee recovery after resizing, cropping or block-grid changes.
const MAX_BYTES = 120, HEADER_MAGIC = 'RFSI', REPEAT_HEADER = 9, REPEAT_BODY = 5, STRENGTH = 70;
const basis2 = new Float64Array(8), basis3 = new Float64Array(8);
for (let x = 0; x < 8; x++) {
  basis2[x] = Math.sqrt(2/8) * Math.cos(((2*x+1)*2*Math.PI)/16);
  basis3[x] = Math.sqrt(2/8) * Math.cos(((2*x+1)*3*Math.PI)/16);
}
const bitsOf = bytes => {
  const bits = [];
  for (const byte of bytes) for (let shift = 7; shift >= 0; shift--) bits.push((byte >>> shift) & 1);
  return bits;
};
const bytesOf = bits => {
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    let value = 0; for (let b = 0; b < 8; b++) value = (value << 1) | bits[i*8+b];
    bytes[i] = value;
  }
  return bytes;
};
const repeatBits = (bytes, repeat) => {
  const bits = bitsOf(bytes), out = new Uint8Array(bits.length * repeat);
  let p = 0; for (const bit of bits) for (let r = 0; r < repeat; r++) out[p++] = bit;
  return out;
};
const majority = bits => bits.reduce((sum, bit) => sum + bit, 0) > bits.length / 2 ? 1 : 0;
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function shuffledBlocks(width, height) {
  const cols = Math.floor(width / 8), rows = Math.floor(height / 8);
  const blocks = new Uint32Array(cols * rows);
  for (let i = 0; i < blocks.length; i++) blocks[i] = i;
  let seed = (Math.imul(width, 73856093) ^ Math.imul(height, 19349663) ^ 0x5f3759df) >>> 0;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = blocks.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1)), tmp = blocks[i]; blocks[i] = blocks[j]; blocks[j] = tmp;
  }
  return {blocks, cols, rows};
}
function coefficientDiff(data, width, cols, blockIndex) {
  const bx = (blockIndex % cols) * 8, by = Math.floor(blockIndex / cols) * 8;
  let c23 = 0, c32 = 0;
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const p = ((by+y) * width + bx+x) * 4;
    const lum = .299 * data[p] + .587 * data[p+1] + .114 * data[p+2];
    c23 += lum * basis2[x] * basis3[y]; c32 += lum * basis3[x] * basis2[y];
  }
  return c23 - c32;
}
function setBlockBit(data, width, cols, blockIndex, bit) {
  const bx = (blockIndex % cols) * 8, by = Math.floor(blockIndex / cols) * 8;
  let c23 = 0, c32 = 0;
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const p = ((by+y) * width + bx+x) * 4;
    const lum = .299 * data[p] + .587 * data[p+1] + .114 * data[p+2];
    c23 += lum * basis2[x] * basis3[y]; c32 += lum * basis3[x] * basis2[y];
  }
  const adjust = ((bit ? STRENGTH : -STRENGTH) - (c23 - c32)) / 2;
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const p = ((by+y) * width + bx+x) * 4;
    const delta = adjust * (basis2[x] * basis3[y] - basis3[x] * basis2[y]);
    data[p] = Math.max(0, Math.min(255, Math.round(data[p] + delta)));
    data[p+1] = Math.max(0, Math.min(255, Math.round(data[p+1] + delta)));
    data[p+2] = Math.max(0, Math.min(255, Math.round(data[p+2] + delta)));
  }
}
function readRepeated(data, width, layout, start, bitCount, copies) {
  const bits = new Uint8Array(bitCount);
  for (let i = 0; i < bitCount; i++) {
    const votes = [];
    for (let r = 0; r < copies; r++) {
      const blockIndex = layout.blocks[start + i * copies + r];
      votes.push(coefficientDiff(data, width, layout.cols, blockIndex) >= 0 ? 1 : 0);
    }
    bits[i] = majority(votes);
  }
  return bits;
}
function buildSocialBits(payload) {
  const header = join(enc.encode(HEADER_MAGIC), new Uint8Array([payload.length]));
  const body = join(u32(crc32(payload)), payload);
  return join(repeatBits(header, REPEAT_HEADER), repeatBits(body, REPEAT_BODY));
}
function decodeSocialBytes(data, width, height) {
  const layout = shuffledBlocks(width, height), headerBlocks = 5 * 8 * REPEAT_HEADER;
  if (layout.blocks.length < headerBlocks) throw new Error('Image is too small for the experimental signal. Use a larger image.');
  const header = bytesOf(readRepeated(data, width, layout, 0, 5*8, REPEAT_HEADER));
  if (dec.decode(header.slice(0,4)) !== HEADER_MAGIC) throw new Error('No valid Social Signal header. Recompression, resizing, cropping or block misalignment may have destroyed it.');
  const length = header[4];
  if (length < 1 || length > MAX_BYTES) throw new Error('Decoded payload length is invalid. The processed image may be damaged.');
  const needed = headerBlocks + (4 + length) * 8 * REPEAT_BODY;
  if (layout.blocks.length < needed) throw new Error('Image dimensions do not provide enough blocks to recover this payload.');
  const body = bytesOf(readRepeated(data, width, layout, headerBlocks, (4 + length) * 8, REPEAT_BODY));
  const payload = body.slice(4);
  if (crc32(payload) !== readU32(body, 0)) throw new Error('Majority voting could not recover a valid message. Try the original download or another unmodified image.');
  return payload;
}
async function imageDataFromFile(file) {
  const bitmap = await createImageBitmap(file), canvas = document.createElement('canvas');
  canvas.width = bitmap.width; canvas.height = bitmap.height;
  const context = canvas.getContext('2d', {willReadFrequently:true});
  if (!context) throw new Error('Canvas access is unavailable.');
  context.drawImage(bitmap, 0, 0);
  return {canvas, context, imageData:context.getImageData(0,0,canvas.width,canvas.height), width:canvas.width, height:canvas.height};
}
$('socialCarrier').addEventListener('change', event => {
  const file = event.target.files[0]; if (file) updateFileMetrics(file, 'Social Signal · experimental');
});
$('secureFile').addEventListener('change', event => {
  const file = event.target.files[0]; if (file) updateFileMetrics(file, 'Secure file share');
});
$('socialEmbed').addEventListener('click', async () => {
  try {
    const file = $('socialCarrier').files[0];
    if (!file) throw new Error('Choose an image carrier first.');
    const text = $('socialMessage').value;
    if (!text.trim()) throw new Error('Enter a short text, link or key first.');
    let payload = enc.encode(text);
    if (payload.length > MAX_BYTES) throw new Error('Message is ' + payload.length + ' UTF-8 bytes. Reduce it to ' + MAX_BYTES + ' bytes or fewer before encryption.');
    const password = $('socialPassword').value;
    if (password) payload = await seal(payload, password, 'RFSE1');
    if (payload.length > MAX_BYTES) throw new Error('Encrypted message is ' + payload.length + ' bytes after encryption overhead. Use a shorter message or omit optional encryption.');
    const {canvas, context, imageData, width, height} = await imageDataFromFile(file);
    const layout = shuffledBlocks(width, height), bits = buildSocialBits(payload);
    if (layout.blocks.length < bits.length) throw new Error('This image has ' + layout.blocks.length + ' usable 8×8 blocks but needs ' + bits.length + '. Use a larger image or shorter message.');
    const data = imageData.data;
    for (let i = 0; i < bits.length; i++) setBlockBit(data, width, layout.cols, layout.blocks[i], bits[i]);
    context.putImageData(imageData, 0, 0);
    // Self-check validates local coding and checksum only, not Instagram compatibility.
    const check = decodeSocialBytes(context.getImageData(0,0,width,height).data, width, height);
    if (check.length !== payload.length || check.some((v, i) => v !== payload[i])) throw new Error('Local codec self-check failed; the image was not exported.');
    const blob = await new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Could not create PNG output.')), 'image/png'));
    const base = file.name.replace(/\.[^.]+$/, '') || 'image';
    save(blob, base + '-social-signal.png');
    $('preview').replaceChildren(Object.assign(document.createElement('img'), {alt:'Social Signal image preview',src:URL.createObjectURL(blob)}));
    $('metricName').textContent = base + '-social-signal.png'; $('metricSize').textContent = fmt(blob.size);
    setStatus('Local encode and checksum self-check passed for ' + payload.length + ' payload bytes. This does not establish Instagram survival; test the image Instagram returns.', 'ok');
  } catch (error) { setStatus(error.message || 'Social Signal encoding failed.', 'error'); }
});
$('socialExtract').addEventListener('click', async () => {
  try {
    const file = $('socialCarrier').files[0];
    if (!file) throw new Error('Choose the image downloaded from Instagram or another test output first.');
    setStatus('Reading image blocks and applying majority-vote error correction…');
    const {imageData, width, height} = await imageDataFromFile(file);
    let payload = decodeSocialBytes(imageData.data, width, height);
    if (hasMagic(payload, 'RFSE1')) payload = await unseal(payload, $('socialPassword').value, 'RFSE1');
    let message;
    try { message = dec.decode(payload); }
    catch { throw new Error('Recovered bytes are not valid UTF-8 text. The payload may have been damaged.'); }
    $('socialRecovered').value = message;
    updateFileMetrics(file, 'Social Signal extraction');
    setStatus('Message recovered and CRC verified (' + payload.length + ' bytes). Verify the value independently before using a key or link.', 'ok');
  } catch (error) { setStatus(error.message || 'Social Signal extraction failed.', 'error'); }
});
$('socialCopy').addEventListener('click', async () => {
  try {
    if (!$('socialRecovered').value) throw new Error('There is no recovered message to copy.');
    await navigator.clipboard.writeText($('socialRecovered').value);
    setStatus('Recovered message copied to clipboard.', 'ok');
  } catch (error) { setStatus(error.message || 'Clipboard access was blocked; select and copy the message manually.', 'warn'); }
});
function makeShareCaption() {
  const value = $('shareLink').value.trim();
  let parsed;
  try { parsed = new URL(value); } catch { throw new Error('Paste a complete hosted share URL first.'); }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error('Use a web URL from your storage host.');
  const caption = 'Encrypted file download: ' + parsed.href + '\nI will share the decryption passphrase separately.';
  $('shareCaption').value = caption;
  return caption;
}
$('prepareShareCaption').addEventListener('click', () => {
  try { makeShareCaption(); setStatus('Message prepared. The passphrase is intentionally not included; copy the text into Instagram and share the passphrase separately.', 'ok'); }
  catch (error) { setStatus(error.message || 'Could not prepare the message.', 'error'); }
});
$('copyShareCaption').addEventListener('click', async () => {
  try {
    const caption = makeShareCaption();
    await navigator.clipboard.writeText(caption);
    setStatus('Instagram message copied. The passphrase is intentionally omitted.', 'ok');
  } catch (error) { setStatus(error.message || 'Could not copy the message. Select the prepared text and copy it manually.', 'warn'); }
});
})();