# Privacy Thesis

Bio-resonance must treat camera frames as radioactive material: useful inside the browser tab, unacceptable as stored or transmitted data.

The system keeps the raw frame local, extracts short-lived signals, and derives a presence hash from normalized measurements. The presence hash is one-way and intentionally insufficient to reconstruct the source vector. It is the only identity artifact meant to cross a subsystem boundary.

Vedic obfuscation is not encryption. It is labeled as obfuscation and must never be represented as a security boundary.

## Guarantees

- Camera frames never leave the browser tab.
- No biometric vector is written to local storage.
- Presence hash generation rejects empty or all-zero vectors.
- Identity generation is rate-limited.
- Demo pages must display the privacy footer whenever the camera is active.
