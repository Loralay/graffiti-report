# Graffiti Report

A very basic Expo / React Native prototype for a school presentation.

Graffiti Report lets demo users report visible city problems in Palermo, vote and comment on reports, mark reports as resolved, and view a simple AI-style city summary.

## Run

This project includes two versions:

- `App.tsx`: Expo / React Native version for Android, iPhone, and web.
- `web-demo/`: zero-install browser demo for quick presentations.

### Quick browser demo

```bash
cd web-demo
python3 -m http.server 8080
```

Open `http://localhost:8080`.

### Expo version

```bash
npm install
npm run web
```

For mobile:

```bash
npm run android
npm run ios
```

The login, photo upload, privacy blur, and location are mocked to keep the project simple and easy to explain.

## Privacy Blur

The function `applyPrivacyBlur()` is a placeholder. In a real app, this is where AI/computer vision would detect and blur faces and car number plates before reports are published.
