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
    
    console.log('Downloading PrinceXML...');
    await execAsync(`wget -O ${tarFile} ${downloadUrl}`);
    
    console.log('Extracting PrinceXML...');
    await execAsync(`tar -xzf ${tarFile} -C /tmp`);
    
    console.log('Installing PrinceXML...');
    await execAsync(`cp -r /tmp/prince-15.1-linux-generic-x86_64/* ${princeDir}/`);
    
    // Make prince executable
    await execAsync(`chmod +x ${princeDir}/bin/prince`);
    
    console.log('PrinceXML installation completed!');
    
    // Test installation
    try {
      const result = await execAsync(`${princeDir}/bin/prince --version`);
      console.log('Prince version:', result.stdout.trim());
    } catch (testError) {
      console.warn('Could not test Prince installation:', testError.message);
    }
    
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