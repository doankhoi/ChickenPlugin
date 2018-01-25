mkdir -p dist
rm -rf dist/*
cp -r background.js content.js popup.html images lib manifest.json scripts utils css dist
rm cohost.zip
zip -r cohost.zip dist/
