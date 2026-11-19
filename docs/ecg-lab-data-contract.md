# Medic Goats ECG Lab — clinical data integration contract (draft)

## Current status

The production UI at `/training/ecg-lab` uses **illustrative synthetic ECGs** and a schematic 3D cardiac model. The activation timeline is a hand-authored educational sequence, **not validated physiological activation data**. Do not use it for patient care or competency testing.

## Target architecture

- **Presentation:** `ecg-lab.html`, `ecg-lab-tools.js`, `ecg-lab-3d.js`.
- **Synthetic example generator:** `ecg-lab-engine.js`; correctly derives the standard lead relationships from virtual electrode signals but has no clinically calibrated amplitudes.
- **Activation source:** `ecg-lab-activation.js`; replaceable illustration with explicit provenance and validated flag.
- **Clinical reference adapter (future):** load annotated, de-identified 12-lead clinical recordings with verified sampling rate, scale and lead identities, and clear provenance. Preserve source waveform samples; do not synthesize or guess missing leads.

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

Every listed lead must have `samplingHz * durationSeconds` samples. Above arrays are placeholders, **not a valid recording**. No personal identifiers should be imported.

## Validation gates before educational release

1. Verify license, citations, recording provenance and patient privacy.
2. Confirm all 12 lead labels, sample rate, voltage calibration, duration and gain.
3. Check lead identities with tolerance appropriate to acquisition precision; note that real recordings may show noise and tiny acquisition differences.
4. Have an ECG-qualified reviewer assess reference selection, waveform authenticity and any diagnosis annotations.
5. Explicitly distinguish clinical recordings, simulated forward-model signals, and synthetic teaching illustrations in the UI.
6. For future heart–torso simulations, document geometry source, physical units, numerical method, electrode layout and validation datasets. Do not label a render medically accurate solely because it looks anatomical.

## Activation dataset contract (future)

A validated map must include a heart mesh coordinate system; node/element IDs; activation and recovery times with physical units; anatomy registration; source publication; acquisition or simulation method; license; and validation limitations. The current 0–800 ms stage timeline is **not** such a map.
