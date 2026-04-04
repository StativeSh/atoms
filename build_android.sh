#!/bin/bash

# ChemVerse Android Build Script
echo "🧹 Cleaning previous build..."
rm -rf www
mkdir -p www

echo "📦 Copying files to www directory..."
# Copy HTML files
cp *.html www/

# Copy CSS files
cp *.css www/

# Copy JS files
cp *.js www/

# Remove node_modules or unneeded scripts from www if they accidentally matched
rm -rf www/build_android.sh 2>/dev/null

echo "✅ Build complete! 'www' folder is ready for Capacitor."
