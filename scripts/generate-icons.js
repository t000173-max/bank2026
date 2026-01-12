const fs = require('fs');
const path = require('path');

/**
 * Script to generate app icons and splash screens from SVG
 * 
 * This script requires sharp to be installed:
 * npm install --save-dev sharp
 * 
 * Usage: node scripts/generate-icons.js
 */

async function generateIcons() {
  try {
    // Check if sharp is available
    let sharp;
    try {
      sharp = require('sharp');
    } catch (e) {
      console.error('Error: sharp is not installed.');
      console.error('Please install it by running: npm install --save-dev sharp');
      process.exit(1);
    }

    const assetsDir = path.join(__dirname, '..', 'assets', 'images');
    const svgPath = path.join(assetsDir, 'icon.svg');

    if (!fs.existsSync(svgPath)) {
      console.error(`Error: SVG file not found at ${svgPath}`);
      process.exit(1);
    }

    console.log('Generating icons from SVG...');

    // Read the SVG
    const svgBuffer = fs.readFileSync(svgPath);

    // Generate main app icon (1024x1024)
    await sharp(svgBuffer)
      .resize(1024, 1024)
      .png()
      .toFile(path.join(assetsDir, 'icon.png'));
    console.log('✓ Generated icon.png (1024x1024)');

    // Generate splash icon (200x200 as specified in app.json)
    await sharp(svgBuffer)
      .resize(200, 200)
      .png()
      .toFile(path.join(assetsDir, 'splash-icon.png'));
    console.log('✓ Generated splash-icon.png (200x200)');

    // Generate favicon (32x32)
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(assetsDir, 'favicon.png'));
    console.log('✓ Generated favicon.png (32x32)');

    // Generate Android adaptive icon foreground (1024x1024, but will be masked)
    // The foreground should be the icon without background, centered
    await sharp(svgBuffer)
      .resize(1024, 1024)
      .png()
      .toFile(path.join(assetsDir, 'android-icon-foreground.png'));
    console.log('✓ Generated android-icon-foreground.png (1024x1024)');

    // Generate Android adaptive icon background (solid yellow color)
    const yellowBackground = sharp({
      create: {
        width: 1024,
        height: 1024,
        channels: 4,
        background: { r: 255, g: 215, b: 0, alpha: 1 } // #FFD700
      }
    })
      .png()
      .toFile(path.join(assetsDir, 'android-icon-background.png'));
    await yellowBackground;
    console.log('✓ Generated android-icon-background.png (1024x1024)');

    // Generate Android monochrome icon (black and white version)
    await sharp(svgBuffer)
      .resize(1024, 1024)
      .greyscale()
      .png()
      .toFile(path.join(assetsDir, 'android-icon-monochrome.png'));
    console.log('✓ Generated android-icon-monochrome.png (1024x1024)');

    console.log('\n✅ All icons generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Review the generated icons in assets/images/');
    console.log('2. Run: npx expo prebuild --clean (if using bare workflow)');
    console.log('3. Or restart your Expo dev server to see the changes');

  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();

