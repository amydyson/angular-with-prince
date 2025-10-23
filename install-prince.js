const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function installPrinceXML() {
  console.log('Installing PrinceXML for Heroku...');
  
  try {
    // Create vendor directory
    const vendorDir = '/app/vendor';
    const princeDir = path.join(vendorDir, 'prince');
    
    if (!fs.existsSync(vendorDir)) {
      fs.mkdirSync(vendorDir, { recursive: true });
      console.log('Created vendor directory');
    }
    
    if (!fs.existsSync(princeDir)) {
      fs.mkdirSync(princeDir, { recursive: true });
      console.log('Created prince directory');
    }
    
    // Download and extract PrinceXML
    const downloadUrl = 'https://www.princexml.com/download/prince-15.1-linux-generic-x86_64.tar.gz';
    const tarFile = '/tmp/prince.tar.gz';
    const extractDir = '/tmp/prince-extract';
    
    console.log('Downloading PrinceXML...');
    await execAsync(`wget -O ${tarFile} ${downloadUrl}`);
    
    console.log('Creating extraction directory...');
    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true });
    }
    
    console.log('Extracting PrinceXML...');
    await execAsync(`tar -xzf ${tarFile} -C ${extractDir}`);
    
    // Find the extracted directory (it should be prince-15.1-linux-generic-x86_64)
    const extractedContents = fs.readdirSync(extractDir);
    const princeExtractedDir = extractedContents.find(name => name.startsWith('prince-'));
    
    if (!princeExtractedDir) {
      throw new Error('Could not find extracted PrinceXML directory');
    }
    
    const fullExtractedPath = path.join(extractDir, princeExtractedDir);
    console.log('Found extracted PrinceXML at:', fullExtractedPath);
    
    console.log('Installing PrinceXML...');
    await execAsync(`cp -r ${fullExtractedPath}/* ${princeDir}/`);
    
    // Make prince executable - the binary is actually in lib/prince/bin/
    const princeBinary = path.join(princeDir, 'lib', 'prince', 'bin', 'prince');
    if (fs.existsSync(princeBinary)) {
      await execAsync(`chmod +x ${princeBinary}`);
      console.log('Made prince binary executable');
      
      // Test installation
      try {
        const result = await execAsync(`${princeBinary} --version`);
        console.log('PrinceXML installation successful!');
        console.log('Prince version:', result.stdout.trim());
      } catch (testError) {
        console.warn('Could not test Prince installation, but binary exists');
      }
    } else {
      throw new Error(`Prince binary not found at ${princeBinary}`);
    }
    
    // Clean up
    console.log('Cleaning up temporary files...');
    await execAsync(`rm -rf ${tarFile} ${extractDir}`);
    
    console.log('PrinceXML installation completed successfully!');
    
  } catch (error) {
    console.error('Failed to install PrinceXML:', error.message);
    console.log('Continuing build without PrinceXML - PDF generation will show helpful error messages');
    // Don't exit with error code - let the build continue
  }
}

if (require.main === module) {
  installPrinceXML();
}

module.exports = installPrinceXML;