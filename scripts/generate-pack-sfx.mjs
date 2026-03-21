/**
 * Generates short PCM WAVs for pack opening (tear / reveal / hit).
 * Run: node scripts/generate-pack-sfx.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function writeWav(filename, samples, sampleRate = 44100) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = numChannels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-32768, Math.min(32767, Math.floor(samples[i] * 32767)));
    buffer.writeInt16LE(s, offset);
    offset += 2;
  }

  fs.writeFileSync(filename, buffer);
}

function tearSamples() {
  const sr = 44100;
  const len = Math.floor(sr * 0.12);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const env = Math.exp(-t * 14);
    out[i] = (Math.random() * 2 - 1) * 0.38 * env;
  }
  return out;
}

function revealSamples() {
  const sr = 44100;
  const len = Math.floor(sr * 0.22);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / len;
    const f = 180 + t * 520;
    const env = Math.sin(Math.PI * t) * 0.55;
    out[i] = Math.sin((2 * Math.PI * f * i) / sr) * env * 0.32;
  }
  return out;
}

function hitSamples() {
  const sr = 44100;
  const len = Math.floor(sr * 0.38);
  const out = new Float32Array(len);
  const freqs = [523.25, 659.25, 783.99];
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const env = Math.exp(-t * 4.2) * 0.48;
    let s = 0;
    for (const f of freqs) {
      s += Math.sin((2 * Math.PI * f * i) / sr);
    }
    out[i] = (s / freqs.length) * env;
  }
  return out;
}

const outDir = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(outDir, { recursive: true });

writeWav(path.join(outDir, 'pack_tear.wav'), tearSamples());
writeWav(path.join(outDir, 'pack_reveal.wav'), revealSamples());
writeWav(path.join(outDir, 'pack_hit.wav'), hitSamples());

console.log('Wrote pack_tear.wav, pack_reveal.wav, pack_hit.wav →', outDir);
