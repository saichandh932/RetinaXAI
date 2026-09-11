# How to execute the completed project

## A. MATLAB pipeline (recommended first test)

Open MATLAB and run:

```matlab
cd('.../SIH/matlab')
run_demo
```

Then test a real image:

```matlab
addpath(genpath(pwd));
r = runDRScreening('C:\\fundus\\patient001.jpg');
disp(r.severity)
disp(r.quality)
disp(r.referral)
saveScreeningJSON(r)
```

Required MATLAB functionality for the included baseline: Image Processing Toolbox. Optional Grad-CAM requires Deep Learning Toolbox and a compatible `DRModel.mat`.

## B. React application

From the project root:

```bash
npm install
npm run dev
```

The UI remains in demo mode by default so it opens without MATLAB.

To point the UI at a MATLAB Production Server REST deployment, create `.env.local`:

```text
VITE_DR_BACKEND_MODE=rest
```

and configure the endpoint in `src/backend.js` if your server uses a different URL.

## C. What is still model-dependent

The ZIP contains all executable pipeline modules, but it cannot contain a legitimate trained DR model unless one is supplied. `models/DRModel.mat` is intentionally left empty. Without it, the pipeline uses the documented image-processing fallback and Grad-CAM returns empty.
