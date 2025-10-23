#!/bin/bash

# Script to install PrinceXML on Heroku

set -e

echo "Installing PrinceXML..."

# Create temp directory
mkdir -p /tmp/prince

# Download PrinceXML for Linux
cd /tmp/prince
wget https://www.princexml.com/download/prince-15.1-linux-generic-x86_64.tar.gz

# Extract
tar -xzf prince-15.1-linux-generic-x86_64.tar.gz

# Install to /app/vendor/prince (Heroku convention)
mkdir -p /app/vendor/prince
cp -r prince-15.1-linux-generic-x86_64/* /app/vendor/prince/

# Run the installation script
cd /app/vendor/prince
yes | ./install.sh

# Add to PATH for this build
export PATH="/app/vendor/prince/bin:$PATH"

# Clean up
rm -rf /tmp/prince

echo "PrinceXML installation completed!"
echo "Prince version: $(prince --version || echo 'Prince not found in PATH')"