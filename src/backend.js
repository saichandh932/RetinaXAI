/**
 * DR VisionAI — Backend Adapter Layer
 *
 * This module provides a clean abstraction for model inference.
 * Supported modes:
 *   - 'demo'   : Sample fallback for testing and demonstration only
 *   - 'python' : Calls the live Colab-trained model API
 *   - 'rest'   : Optional REST backend placeholder for future server deployment
 *
 * To switch modes: set DR_Backend.mode before any calls.
 */

// ─── Demo Data ─────────────────────────────────────────────────────────────
const DEMO_CASES = {
  normal: {
    caseId: 'DEMO-001',
    label: 'Normal Retina',
    imagePlaceholder: 'normal',
    quality: {
      score: 92,
      status: 'GOOD',
      focus: { score: 94, status: 'good' },
      illumination: { score: 91, status: 'good' },
      fov: { score: 90, status: 'good' },
      contrast: { score: 93, status: 'good' },
      artifacts: { score: 95, status: 'low' },
    },
    severity: { level: 0, label: 'No DR', detail: 'No diabetic retinopathy detected' },
    confidence: 0.94,
    lesions: {
      microaneurysms: { detected: false, count: 0, confidence: 0.02 },
      exudates: { detected: false, area: 0, confidence: 0.01 },
      hemorrhages: { detected: false, count: 0, confidence: 0.03 },
      neovascularization: { detected: false, confidence: 0.01 },
      vessels: { detected: true },
      opticDisc: { detected: true, x: 0.72, y: 0.42 },
      fovea: { detected: true, x: 0.38, y: 0.50 },
    },
    referral: {
      recommended: false,
      priority: 'ROUTINE',
      reason: 'No referable diabetic retinopathy detected. Annual follow-up recommended.',
    },
    processingTime: 3.2,
  },

  mild: {
    caseId: 'DEMO-002',
    label: 'Mild NPDR',
    imagePlaceholder: 'mild',
    quality: {
      score: 88,
      status: 'GOOD',
      focus: { score: 90, status: 'good' },
      illumination: { score: 86, status: 'good' },
      fov: { score: 89, status: 'good' },
      contrast: { score: 88, status: 'good' },
      artifacts: { score: 91, status: 'low' },
    },
    severity: { level: 1, label: 'Mild NPDR', detail: 'Mild Non-Proliferative Diabetic Retinopathy' },
    confidence: 0.87,
    lesions: {
      microaneurysms: { detected: true, count: 6, confidence: 0.82 },
      exudates: { detected: false, area: 0, confidence: 0.15 },
      hemorrhages: { detected: false, count: 0, confidence: 0.09 },
      neovascularization: { detected: false, confidence: 0.02 },
      vessels: { detected: true },
      opticDisc: { detected: true, x: 0.71, y: 0.44 },
      fovea: { detected: true, x: 0.37, y: 0.51 },
    },
    referral: {
      recommended: false,
      priority: 'LOW',
      reason: 'Mild NPDR detected. Monitor annually. Optimise glycaemic control.',
    },
    processingTime: 3.8,
  },

  moderate: {
    caseId: 'DEMO-003',
    label: 'Moderate NPDR',
    imagePlaceholder: 'moderate',
    quality: {
      score: 87,
      status: 'GOOD',
      focus: { score: 88, status: 'good' },
      illumination: { score: 85, status: 'good' },
      fov: { score: 91, status: 'good' },
      contrast: { score: 86, status: 'good' },
      artifacts: { score: 88, status: 'low' },
    },
    severity: { level: 2, label: 'Moderate NPDR', detail: 'Moderate Non-Proliferative Diabetic Retinopathy' },
    confidence: 0.91,
    lesions: {
      microaneurysms: { detected: true, count: 14, confidence: 0.89 },
      exudates: { detected: true, area: 'moderate', confidence: 0.94 },
      hemorrhages: { detected: true, count: 5, confidence: 0.88 },
      neovascularization: { detected: false, confidence: 0.04 },
      vessels: { detected: true },
      opticDisc: { detected: true, x: 0.73, y: 0.43 },
      fovea: { detected: true, x: 0.39, y: 0.50 },
    },
    referral: {
      recommended: true,
      priority: 'MEDIUM',
      reason: 'Referable DR suspected based on multiple detected lesions including microaneurysms, haemorrhages, and exudates.',
    },
    processingTime: 4.1,
  },

  severe: {
    caseId: 'DEMO-004',
    label: 'Severe NPDR',
    imagePlaceholder: 'severe',
    quality: {
      score: 83,
      status: 'ACCEPTABLE',
      focus: { score: 82, status: 'acceptable' },
      illumination: { score: 84, status: 'good' },
      fov: { score: 85, status: 'good' },
      contrast: { score: 80, status: 'acceptable' },
      artifacts: { score: 86, status: 'low' },
    },
    severity: { level: 3, label: 'Severe NPDR', detail: 'Severe Non-Proliferative Diabetic Retinopathy' },
    confidence: 0.88,
    lesions: {
      microaneurysms: { detected: true, count: 32, confidence: 0.91 },
      exudates: { detected: true, area: 'extensive', confidence: 0.93 },
      hemorrhages: { detected: true, count: 18, confidence: 0.90 },
      neovascularization: { detected: false, confidence: 0.12 },
      vessels: { detected: true },
      opticDisc: { detected: true, x: 0.70, y: 0.45 },
      fovea: { detected: true, x: 0.36, y: 0.51 },
    },
    referral: {
      recommended: true,
      priority: 'HIGH',
      reason: 'Urgent referral indicated. Severe NPDR with extensive haemorrhages and high risk of progression to PDR.',
    },
    processingTime: 4.5,
  },

  pdr: {
    caseId: 'DEMO-005',
    label: 'Proliferative DR (PDR)',
    imagePlaceholder: 'pdr',
    quality: {
      score: 81,
      status: 'ACCEPTABLE',
      focus: { score: 80, status: 'acceptable' },
      illumination: { score: 83, status: 'good' },
      fov: { score: 82, status: 'good' },
      contrast: { score: 79, status: 'acceptable' },
      artifacts: { score: 84, status: 'low' },
    },
    severity: { level: 4, label: 'Proliferative DR', detail: 'Proliferative Diabetic Retinopathy — vision-threatening' },
    confidence: 0.93,
    lesions: {
      microaneurysms: { detected: true, count: 50, confidence: 0.95 },
      exudates: { detected: true, area: 'severe', confidence: 0.96 },
      hemorrhages: { detected: true, count: 35, confidence: 0.94 },
      neovascularization: { detected: true, confidence: 0.92 },
      vessels: { detected: true },
      opticDisc: { detected: true, x: 0.71, y: 0.44 },
      fovea: { detected: true, x: 0.37, y: 0.50 },
    },
    referral: {
      recommended: true,
      priority: 'HIGH',
      reason: 'URGENT: Proliferative DR with neovascularization detected. Immediate ophthalmologist consultation required.',
    },
    processingTime: 5.2,
  },

  poor_quality: {
    caseId: 'DEMO-006',
    label: 'Poor Quality Image',
    imagePlaceholder: 'poor',
    quality: {
      score: 38,
      status: 'UNGRADABLE',
      focus: { score: 30, status: 'poor' },
      illumination: { score: 45, status: 'poor' },
      fov: { score: 42, status: 'poor' },
      contrast: { score: 35, status: 'poor' },
      artifacts: { score: 28, status: 'high' },
    },
    severity: null,
    confidence: null,
    lesions: null,
    referral: null,
    processingTime: 1.1,
    recaptureInstructions: [
      'Centre the retina within the camera field',
      'Improve focus before capturing',
      'Reduce glare and reflection',
      'Adjust room lighting and illumination',
      'Ask patient to fixate on the target light',
    ],
  },
};

// ─── Analysis Stage Definitions ────────────────────────────────────────────
export const ANALYSIS_STAGES = [
  { id: 'quality',    label: 'Quality Assessment',         duration: 1200 },
  { id: 'enhance',    label: 'Image Enhancement',          duration: 900  },
  { id: 'structure',  label: 'Retinal Structure Analysis', duration: 1400 },
  { id: 'lesion',     label: 'Lesion Detection',           duration: 1600 },
  { id: 'grading',    label: 'DR Severity Grading',        duration: 800  },
  { id: 'xai',        label: 'Explainability Generation',  duration: 700  },
];

// ─── Backend Class ─────────────────────────────────────────────────────────
class DRBackend {
  constructor() {
    this.mode = 'python';          // 'demo' | 'rest' | 'python'
    this.restEndpoint = 'http://localhost:9910/api/v1';  // MATLAB Production Server
    this.pythonEndpoint = 'https://untie-exposure-kilobyte.ngrok-free.dev/api'; // Public ngrok tunnel to Colab/Flask API
    this.modelVersion = 'Colab DR Model';
    this.lastUpdated = '2026-09-10';
  }

  /**
   * Run full DR screening pipeline.
   * @param {File|string} image - Image file or demo case key
   * @param {Function} onProgress - Called with (stageId, stageName, pct) during processing
   * @returns {Promise<ScreeningResult>}
   */
  async runScreening(image, onProgress = () => {}) {
    if (this.mode === 'demo') {
      return this._demoRunScreening(image, onProgress);
    } else if (this.mode === 'rest') {
      return this._restRunScreening(image, onProgress);
    } else if (this.mode === 'python') {
      return this._pythonRunScreening(image, onProgress);
    }
    throw new Error(`Unknown backend mode: ${this.mode}`);
  }

  /**
   * Assess image quality only (before full screening).
   */
  async assessQuality(image) {
    if (this.mode === 'demo') {
      await this._delay(1200);
      const key = typeof image === 'string' ? image : 'moderate';
      return DEMO_CASES[key]?.quality || DEMO_CASES.moderate.quality;
    }
    if (this.mode === 'python') {
      const formData = new FormData();
      formData.append('image', image);

      const response = await fetch(`${this.pythonEndpoint}/screen`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Python backend error: ${response.status} ${errText || ''}`.trim());
      }

      const result = await response.json();
      if (!result.quality) throw new Error('Python backend response did not include image quality.');
      return result.quality;
    }
    return this._apiCall('/quality', { image });
  }

  // ── Demo Mode Implementation ──────────────────────────────────────────────
  async _demoRunScreening(caseKey, onProgress) {
    const caseData = DEMO_CASES[caseKey] || DEMO_CASES.moderate;
    let elapsed = 0;

    for (const stage of ANALYSIS_STAGES) {
      onProgress(stage.id, stage.label, elapsed / 8600);

      // Skip lesion/grading/xai stages for ungradable images
      if (caseData.quality.status === 'UNGRADABLE' && stage.id !== 'quality') {
        break;
      }

      await this._delay(stage.duration);
      elapsed += stage.duration;
    }

    onProgress('done', 'Complete', 1.0);
    return { ...caseData, caseKey };
  }

  // ── REST Mode (MATLAB Production Server) ─────────────────────────────────
  async _restRunScreening(imageFile, onProgress) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${this.restEndpoint}/runDRScreening`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    onProgress('done', 'Complete', 1.0);
    return this._normalizeResult(result);
  }

  // ── Python Mode (Flask/FastAPI Middleware) ────────────────────────────────
  async _pythonRunScreening(imageFile, onProgress) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${this.pythonEndpoint}/screen`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Python backend error: ${response.status} ${errText || ''}`.trim());
    }

    const result = await response.json();
    onProgress('done', 'Complete', 1.0);
    return this._normalizeResult(result);
  }

  /**
   * Normalize MATLAB output struct to internal format.
   * Maps MATLAB field names to our schema.
   */
  _normalizeResult(matlabResult) {
    return {
      quality: matlabResult.quality,
      severity: matlabResult.severity,
      confidence: matlabResult.confidence,
      lesions: matlabResult.lesions,
      referral: matlabResult.referral,
      gradcam: matlabResult.gradcam,
      enhancedImage: matlabResult.enhancedImage,
      vesselMask: matlabResult.vesselMask,
      opticDisc: matlabResult.opticDisc,
      fovea: matlabResult.fovea,
      processingTime: matlabResult.processingTime,
    };
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async _apiCall(path, body) {
    const endpoint = this.mode === 'rest' ? this.restEndpoint : this.pythonEndpoint;
    const response = await fetch(`${endpoint}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  }

  getDemoCases() {
    return DEMO_CASES;
  }

  getSystemStatus() {
    return {
      online: navigator.onLine,
      modelVersion: this.modelVersion,
      lastUpdated: this.lastUpdated,
      mode: this.mode,
      pendingSync: parseInt(localStorage.getItem('dr_pending_sync') || '0'),
    };
  }
}

// Singleton export
export const DR_Backend = new DRBackend();
export { DEMO_CASES };
