# ECG Lab clinical library — publication workflow

**Status:** Clinical library interface and conversion tooling are installed, but **no clinical ECG waveform has been published yet**. Do not insert synthetic or hand-drawn ECG traces into the clinical manifest.

## Source dataset

PTB-XL version 1.0.3 — https://physionet.org/content/ptb-xl/1.0.3/

License: **Creative Commons Attribution 4.0** (verify current terms before public redistribution).

Citation: Wagner P, Strodthoff N, Bousseljot R-D, et al. PTB-XL, a large publicly available electrocardiography dataset. *Scientific Data* 7, 154 (2020). https://doi.org/10.1038/s41597-020-0495-6

## Add a recording

1. Download the official `.hea` and `.dat` pair from the matching PTB-XL version. Verify record ID against `ptbxl_database.csv`; review the corresponding `scp_codes` with `scp_statements.csv`. Do not classify a recording from a guessed filename or solely from a single algorithmic annotation.
2. Run `pip install wfdb numpy`, then `python scripts/convert_ptbxl_ecg.py records100/00000/00001_lr --record-id 00001` using an actual downloaded record. Conversion preserves waveform samples in mV and keeps the original lead names.
3. Confirm the JSON loads with all 12 leads, physically plausible amplitudes, accurate sample rate and duration, and inspect the ECG clinically. Review annotations and waveform quality with a qualified ECG educator; ensure the record contains no personally identifying metadata.
4. Place the file in `ecg-library/records/00001.json`. **Only after review**, add a manifest entry:

```json
{
  "id": "ptbxl-00001",
  "title": "Reviewed educational example",
  "dataset": "PTB-XL v1.0.3",
  "sourceRecordId": "00001",
  "file": "/ecg-library/records/00001.json",
  "reviewStatus": "reviewed"
}
```

5. The ECG library selector will include the recording when the new manifest and waveform file deploy together. Confirm the 3×4 leads, chosen full-width strip, recording timing, print output, and attribution on iPad.

**Important:** `reviewStatus` and `validatedForTeaching` are publication metadata, not guarantees of diagnostic accuracy. The educational 3D heart is not synchronized to patient-specific activation maps. Do not present them as patient-matched data.

## Privacy and availability

The library uses de-identified dataset recordings and serves the approved waveform files publicly from the site. The separate local-file importer reads files inside the browser and does not itself upload them. Do not put unpublished medical records or personally identifying information in the public repository.

## GitHub workflow: fetch a genuine candidate without publishing it

The repository now includes **Actions → Prepare PTB-XL ECG review candidate**. It is a manually triggered workflow (`workflow_dispatch`), and the default candidate is `ecg_id=3`. PTB-XL v1.0.3 metadata identifies ECG 3 with `NORM` and `SR` annotations; those labels alone do not certify a clinically perfect example.

When run, the workflow:
1. Retrieves current v1.0.3 metadata and the corresponding official 100 Hz WFDB waveform pair from PhysioNet.
2. Verifies the record ID, expected paths, source labels, and twelve channel units and values.
3. Converts the record into the Clinical ECG Lab JSON schema and uploads **a temporary private GitHub Actions artifact** named `ptbxl-clinical-review-candidate`.
4. Does **not** commit, deploy, or publish a waveform automatically.

A qualified ECG reviewer should inspect the actual tracing, compare it with the source annotation, ensure the waveform is suitable for education, and approve attribution and publication. Only then copy the reviewed `clinical-ecg.json` into `ecg-library/records/00003.json` and add a reviewed entry to `ecg-library/manifest.json` using `dataset: "PTB-XL v1.0.3"`, `sourceRecordId: "3"` and `file: "/ecg-library/records/00003.json"`.

If the action cannot reach PhysioNet, its run will fail without publishing anything; retrying will be necessary after connectivity is available. The converter and checks cannot replace a clinician's waveform review.
