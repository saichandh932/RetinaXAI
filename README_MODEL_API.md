# Colab model integration guide

This project now defaults to a real Python model backend instead of demo mode.

## 1) Put your trained model in Colab
Upload one of these files to Colab:

- model.keras
- model.h5
- retina_model.keras
- retina_model.h5

## 2) Start the API in Colab
Run this in a Colab cell:

```python
!pip install flask flask-cors pillow tensorflow

from google.colab import files

# Upload your model file if needed
# files.upload()

# Then either place the file in /content or set MODEL_PATH
# Example:
# !mv /content/model.keras /content/model.keras
```

Then start the server:

```python
!python /content/colab_model_api.py
```

If you need to specify the model path explicitly:

```python
MODEL_PATH="/content/model.keras"
```

You can also start it with environment variables:

```bash
MODEL_PATH=/content/model.keras python colab_model_api.py
```

## 3) Point the React app to your Colab endpoint
In the app, the default backend URL is set to:

```js
http://localhost:5001/api
```

For a Colab server, set the real public URL in the Settings page or in `src/backend.js`:

```js
this.pythonEndpoint = 'https://your-colab-url-xxxx.ngrok-free.app/api';
```

## 4) Use the app
Open the app and run a screening. The app will use the live model endpoint instead of demo data.

## 5) Expected API contract
The server should respond to POST `/api/screen` with multipart form data containing an `image` field.

Response format should include:

- `quality`
- `severity`
- `confidence`
- `lesions`
- `referral`
- `gradcam`
- `processingTime`

The app will normalize the result automatically.
