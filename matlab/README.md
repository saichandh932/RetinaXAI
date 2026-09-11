# RETINA-XAI MATLAB Module

## Direct execution
1. Open MATLAB.
2. Set the current folder to this `matlab` folder.
3. Run:

```matlab
run_demo
```

This executes the complete baseline pipeline and writes results to `results/`.

## Run on a real fundus image

```matlab
addpath(genpath(pwd));
result = runDRScreening("C:\\path\\to\\fundus.jpg");
result.severity
result.quality
result.referral
```

On Linux/macOS:

```matlab
result = runDRScreening("/path/to/fundus.jpg");
```

## Modules
- `assessImageQuality.m` — focus, illumination, FOV, contrast, artifacts
- `preprocessRetinalImage.m` — resize, CLAHE, illumination correction, denoising
- `segmentRetinalVessels.m` — baseline vessel segmentation
- `detectOpticDisc.m` — optic-disc candidate detection
- `detectFovea.m` — anatomical fovea estimate
- `detectMicroaneurysms.m` — baseline small-dark-lesion detection
- `detectExudates.m` — baseline bright/yellow lesion detection
- `detectHemorrhages.m` — baseline dark-red lesion detection
- `detectNeovascularization.m` — baseline peripapillary vessel-density heuristic
- `gradeDiabeticRetinopathy.m` — prototype Level 0–4 rule engine
- `generateGradCAM.m` — optional Grad-CAM when `models/DRModel.mat` exists
- `generateReferral.m` — prototype referral triage
- `runDRScreening.m` — end-to-end orchestrator

## Important
The included detectors are executable research baselines. They are **not clinically validated** and should not be presented as a diagnostic medical device. For a final SIH system, train/validate a 5-class retinal model on a labeled dataset, evaluate it on a held-out patient-level test set, and use that model for the final grade. Grad-CAM also requires a compatible trained network in `models/DRModel.mat`.
