/**
 * Capture frames from Sketchfab's animated hydra model using Puppeteer.
 *
 * Uses the Sketchfab embed viewer + Viewer API to:
 * 1. Load the model
 * 2. Position camera for a dramatic low angle
 * 3. Slow the animation
 * 4. Capture frames as PNGs
 *
 * Output: /tmp/hydra-frames/frame-XXXX.png
 */

const puppeteer = require("/opt/homebrew/lib/node_modules/puppeteer");
const fs = require("fs");
const path = require("path");

const MODEL_UID = "4d05aa5290e448919bb6876b5da607b4";
const OUTPUT_DIR = "/tmp/hydra-frames";
const FRAME_COUNT = 120; // ~4 seconds at 30fps
const FRAME_DELAY_MS = 100; // delay between captures

// Create an HTML page with the Sketchfab embed + Viewer API
const HTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #000; overflow: hidden; }
    iframe { width: 100vw; height: 100vh; border: none; }
  </style>
</head>
<body>
  <iframe id="api-frame"
    src="https://sketchfab.com/models/${MODEL_UID}/embed?autostart=1&ui_controls=0&ui_infos=0&ui_inspector=0&ui_stop=0&ui_watermark=0&ui_watermark_link=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&transparent=1&preload=1"
    allow="autoplay; fullscreen; xr-spatial-tracking">
  </iframe>
  <script type="text/javascript" src="https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js"></script>
  <script>
    window.viewerReady = false;
    window.apiInstance = null;

    var iframe = document.getElementById('api-frame');
    var client = new Sketchfab(iframe);

    client.init('${MODEL_UID}', {
      success: function(api) {
        window.apiInstance = api;
        api.start();
        api.addEventListener('viewerready', function() {
          console.log('VIEWER_READY');
          window.viewerReady = true;

          // Slow down animation
          api.setSpeed(0.3);

          // Set dark background
          api.setBackground({ color: [0, 0, 0] });
        });
      },
      error: function() { console.log('VIEWER_ERROR'); },
      autostart: 1,
      ui_controls: 0,
      ui_infos: 0,
      ui_stop: 0,
      ui_watermark: 0,
      transparent: 1,
      preload: 1,
    });
  </script>
</body>
</html>
`;

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: false, // Need visible window for WebGL
    args: [
      "--window-size=1920,1080",
      "--disable-web-security",
      "--allow-file-access-from-files",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Write HTML to temp file and load it
  const htmlPath = "/tmp/hydra-capture.html";
  fs.writeFileSync(htmlPath, HTML);

  console.log("Loading Sketchfab embed...");
  await page.goto(`file://${htmlPath}`, { waitUntil: "domcontentloaded", timeout: 30000 });

  // Wait for viewer to be ready
  console.log("Waiting for viewer to load...");
  let ready = false;
  for (let i = 0; i < 60; i++) {
    ready = await page.evaluate(() => window.viewerReady);
    if (ready) break;
    await new Promise((r) => setTimeout(r, 2000));
    process.stdout.write(".");
  }
  console.log("");

  if (!ready) {
    console.log("Viewer did not become ready. Trying direct embed approach...");

    // Fallback: load the Sketchfab page directly
    await page.goto(
      `https://sketchfab.com/models/${MODEL_UID}/embed?autostart=1&ui_controls=0&ui_infos=0&ui_watermark=0&transparent=1`,
      { waitUntil: "networkidle2", timeout: 60000 }
    );

    console.log("Waiting for model to render...");
    await new Promise((r) => setTimeout(r, 15000));
  } else {
    // Give extra time for textures to load
    console.log("Viewer ready! Waiting for textures...");
    await new Promise((r) => setTimeout(r, 5000));
  }

  // Capture frames
  console.log(`Capturing ${FRAME_COUNT} frames...`);
  for (let i = 0; i < FRAME_COUNT; i++) {
    const framePath = path.join(OUTPUT_DIR, `frame-${String(i).padStart(4, "0")}.png`);
    await page.screenshot({ path: framePath, type: "png" });

    if (i % 10 === 0) console.log(`  Frame ${i}/${FRAME_COUNT}`);
    await new Promise((r) => setTimeout(r, FRAME_DELAY_MS));
  }

  console.log(`Done! ${FRAME_COUNT} frames saved to ${OUTPUT_DIR}`);
  await browser.close();
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
