#!/usr/bin/env python3
"""Convert one locally downloaded PTB-XL WFDB record to the ECG Lab schema.

Install: pip install wfdb numpy
Download matching .hea and .dat from official PhysioNet PTB-XL v1.0.3.
Example: python scripts/convert_ptbxl_ecg.py records100/00000/00001_lr --record-id 00001

This script does NOT determine rhythm, diagnosis, or clinical suitability.
Only publish after manual license, provenance, and clinical educator review.
"""
import argparse
import json
from pathlib import Path

LEADS = ("I", "II", "III", "aVR", "aVL", "aVF", "V1", "V2", "V3", "V4", "V5", "V6")
CITATION = ("Wagner P et al. PTB-XL, a large publicly available electrocardiography dataset. "
            "Scientific Data 7, 154 (2020). https://doi.org/10.1038/s41597-020-0495-6")

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("wfdb_path", help="Path to a local record without .hea/.dat extension")
    parser.add_argument("--record-id", required=True, help="PTB-XL ECG identifier, not a patient identifier")
    parser.add_argument("--output", type=Path, default=None)
    args = parser.parse_args()
    try:
        import wfdb
        import numpy as np
    except ImportError as exc:
        raise SystemExit("Required: pip install wfdb numpy") from exc

    record = wfdb.rdrecord(args.wfdb_path)
    if record.p_signal is None:
        raise SystemExit("Record lacks physical signal samples")
    fs = int(record.fs)
    if fs != record.fs or not 100 <= fs <= 1000:
        raise SystemExit("Unsupported sampling frequency")
    if set(record.sig_name) != set(LEADS) or len(record.sig_name) != 12:
        raise SystemExit("Expected the twelve canonical leads exactly once")
    if any(str(unit).lower() != "mv" for unit in record.units):
        raise SystemExit("WFDB channel units must be mV")
    samples = record.p_signal
    length = int(samples.shape[0])
    if not 1 <= length/fs <= 30:
        raise SystemExit("Recording duration must be 1–30 seconds")
    if not np.isfinite(samples).all() or np.max(np.abs(samples)) > 30:
        raise SystemExit("Recording contains invalid values or exceeds 30 mV")
    channel = {lead:idx for idx,lead in enumerate(record.sig_name)}
    result = {
        "schemaVersion": "1.0",
        "kind": "clinical-recording",
        "source": {
            "dataset": "PTB-XL v1.0.3",
            "recordId": args.record_id,
            "citation": CITATION,
            "license": "CC BY 4.0",
            "validatedForTeaching": False
        },
        "recording": {
            "samplingHz": fs,
            "durationSeconds": length/fs,
            "amplitudeUnit": "mV",
            "leads": list(LEADS)
        },
        "waveforms": {lead: np.round(samples[:,channel[lead]],5).tolist() for lead in LEADS}
    }
    out = args.output or Path("ecg-library/records") / (args.record_id+".json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result,separators=(",",":")),encoding="utf-8")
    print("Converted",args.record_id,"to",out,"(",length,"samples at",fs,"Hz )")
    print("NOT reviewed for teaching. Verify patient privacy, metadata, diagnosis and waveform quality before cataloging.")

if __name__ == "__main__":
    main()
