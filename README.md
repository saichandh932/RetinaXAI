# DR VisionAI – Colab-Powered Retinal Screening System

This project is a clinical screening dashboard for diabetic retinopathy detection and referral triage. It is designed around a live AI inference workflow using a model trained in Google Colab, with an explainability-first interface for rural primary healthcare deployment.

## Problem addressed

India has a large diabetic population and a severe shortage of ophthalmologists, especially in rural areas. This platform is designed for early DR screening, referral prioritization, image quality checks, and explainable AI review in a primary healthcare setting.

## Core workflow

1. Capture or upload a retinal fundus image
2. Assess image quality and reject ungradable images
3. Run AI analysis using the Colab-trained model
4. Display DR severity (Levels 0–4), confidence, and lesion cues
5. Recommend referral for Level 2+ cases
6. Generate explainability and clinical review views
7. Support telemedicine and program-level monitoring

## Architecture

- Frontend: React + Vite
- Model runtime: Google Colab + Flask/FastAPI inference API
- Data flow: image upload → preprocessing → model prediction → severity + referral output
- Human-in-the-loop: clinician review and evidence-based screening decision support

## Local development

```bash
npm install
npm run dev
```

The app now defaults to the real Python/Colab backend mode instead of demo-only behavior.

## Colab integration

Use the trained model file from Google Colab and expose it via a public endpoint. The backend should support:

- POST /api/screen
- multipart form field named image
- JSON response with quality, severity, confidence, lesions, referral, and processingTime

See [README_MODEL_API.md](README_MODEL_API.md) for the complete API setup guide.

## Clinical goals

- DR severity grading on the International Clinical DR scale
- Referable DR sensitivity > 90%
- Specificity > 85% for referable DR
- Explainability via attention and lesion evidence
- Field deployment support for district-level screening workflows
