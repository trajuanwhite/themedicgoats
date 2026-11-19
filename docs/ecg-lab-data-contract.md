# Medic Goats ECG Lab — clinical data integration contract (draft)

## Current status

The production UI at `/training/ecg-lab` uses **illustrative synthetic ECGs** and a schematic 3D cardiac model. The activation timeline is a hand-authored educational sequence, **not validated physiological activation data**. Do not use it for patient care or competency testing.

## Target architecture

- **Presentation:** `ecg-lab.html`, `ecg-lab-tools.js`, `ecg-lab-3d.js`.
- **Synthetic example generator:** `ecg-lab-engine.js`; correctly derives the standard lead relationships from virtual electrode signals but has no clinically calibrated amplitudes.
- **Activation source:** `ecg-lab-activation.js`; replaceable illustration with explicit provenance and validated flag.
- **Clinical reference viewer (v0.6):** import a local JSON recording with all 12 leads. The viewer checks required metadata, array lengths and numerical values; it cannot verify provenance, clinical authenticity or the license. A curated, expert-reviewed ECG library is still future work.

## Proposed versioned recording object

```json
{
  "schemaVersion": "1.0",
  "kind": "clinical-recording",
  "source": {
    "dataset": "DATASET NAME",
    "recordId": "DE-IDENTIFIED RECORD ID",
    "citation": "SOURCE PUBLICATION OR DOI",
    "license": "VERIFIED LICENSE",
    "validatedForTeaching": false
  },
  "recording": {
    "samplingHz": 500,
    "durationSeconds": 10,
    "amplitudeUnit": "mV",
    "leads": ["I","II","III","aVR","aVL","aVF","V1","V2","V3","V4","V5","V6"]
  },
  "waveforms": {
    "I": [],
    "II": []
  }
}
```

Every listed lead must have `samplingHz * durationSeconds` samples. Above arrays are placeholders, **not a valid recording**. No personal identifiers should be imported. The 12 canonical lead names must all be present as keys in `waveforms`, each containing numeric millivolt samples. File imports are limited to 8 MB, a sample rate of 100–1,000 Hz, and 1–30 seconds. The first 2 seconds appear initially; use the recording-position slider to view later segments. Do not use for clinical decisions.

## Validation gates before educational release

1. Verify license, citations, recording provenance and patient privacy.
2. Confirm all 12 lead labels, sample rate, voltage calibration, duration and gain.
3. Check lead identities with tolerance appropriate to acquisition precision; note that real recordings may show noise and tiny acquisition differences.
4. Have an ECG-qualified reviewer assess reference selection, waveform authenticity and any diagnosis annotations.
5. Explicitly distinguish clinical recordings, simulated forward-model signals, and synthetic teaching illustrations in the UI.
6. For future heart–torso simulations, document geometry source, physical units, numerical method, electrode layout and validation datasets. Do not label a render medically accurate solely because it looks anatomical.

## Activation dataset contract (future)

A validated map must include a heart mesh coordinate system; node/element IDs; activation and recovery times with physical units; anatomy registration; source publication; acquisition or simulation method; license; and validation limitations. The current 0–800 ms stage timeline is **not** such a map.

## V0.6 implementation notes

- The **Clinical ECG comparison** panel displays uploaded local JSON in a *separate*, static 12-lead chart. It is not coupled to synthetic cardiac activation and does not alter the heart model.
- Files are parsed in-browser using `File.text()` and not uploaded by this feature. No clinical sample file is bundled.
- Source-provided `validatedForTeaching: true` is not independently verified and must never be represented as product certification.
- The responsive SVG viewer uses a fixed example vertical mapping of **25 SVG units per mV**, not a calibrated 10 mm/mV paper scale. It is not suitable for diagnostic interval, amplitude or ST measurements.
- A source ECG must be converted to millivolts and supplied under the exact standard 12 labels; do not fabricate missing leads.
- To add a public clinical library, secure the applicable dataset license, remove identifying metadata, verify labels/calibration, document attribution, and complete qualified ECG educator review.
