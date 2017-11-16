mkdir -p dist
rm -rf dist/*
cp -r background.js content.js images lib manifest.json scripts utils dist 
rm cohost.zip
zip -r cohost.zip dist/
