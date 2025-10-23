const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

console.log('Starting server...');

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || false // Set this to your frontend domain in production
    : ['http://localhost:4200', 'http://localhost:3000'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Note: Static files served by AWS Amplify, not this backend
// Removed express.static to prevent path-to-regexp errors on Heroku

console.log('Middleware configured...');

app.post('/api/generate-pdf', async (req, res) => {
  try {
    const { html, options = {} } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    console.log('Received PDF generation request for HTML content of length:', html.length);

    // Check if PrinceXML binary is available by testing execution
    let princeAvailable = false;
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      // Try to run prince --version to check if binary exists
      // On Heroku, check the vendor directory first
      let princeCommand = 'prince';
      if (process.env.NODE_ENV === 'production' && process.env.DYNO) {
        // We're on Heroku - the binary is in lib/prince/bin/
        const herokuPrincePath = '/app/vendor/prince/lib/prince/bin/prince';
        if (fs.existsSync(herokuPrincePath)) {
          princeCommand = herokuPrincePath;
          console.log('Using Heroku PrinceXML at:', herokuPrincePath);
        }
      }
      
      await execAsync(`${princeCommand} --version`);
      princeAvailable = true;
      console.log('PrinceXML binary found and available');
    } catch (error) {
      console.log('PrinceXML binary not available:', error.message);
      princeAvailable = false;
    }

    if (!princeAvailable) {
      // Return a helpful HTML response when PrinceXML is not available
      console.log('PrinceXML not available, providing installation instructions');
      
      const instructionsHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PrinceXML Installation Required</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      padding: 2rem; 
      line-height: 1.6; 
      max-width: 900px; 
      margin: 0 auto;
      background: #f8f9fa;
    }
    .container {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .notice { 
      background: linear-gradient(135deg, #fff3cd, #ffeaa7);
      border: 1px solid #ffd93d; 
      padding: 1.5rem; 
      border-radius: 8px; 
      margin-bottom: 2rem;
      border-left: 4px solid #f39c12;
    }
    .content { 
      background: #f8f9fa; 
      padding: 1.5rem; 
      border-radius: 8px; 
      margin-top: 1rem;
      border: 1px solid #dee2e6;
    }
    h1 { 
      color: #e74c3c; 
      margin-top: 0; 
      display: flex; 
      align-items: center; 
      gap: 0.5rem;
    }
    h2 { 
      color: #2c3e50; 
      margin-top: 2rem;
      display: flex; 
      align-items: center; 
      gap: 0.5rem;
    }
    a { 
      color: #3498db; 
      text-decoration: none; 
      font-weight: 500;
    }
    a:hover { 
      text-decoration: underline; 
      color: #2980b9;
    }
    .step { 
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
      padding: 1rem 1.5rem; 
      margin: 1rem 0; 
      border-radius: 8px;
      border-left: 4px solid #2196f3;
      transition: transform 0.2s ease;
    }
    .step:hover {
      transform: translateX(4px);
    }
    .step strong {
      color: #1976d2;
    }
    code {
      background: #f1f3f4;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      color: #d63384;
    }
    .download-section {
      background: #e8f5e8;
      padding: 1rem;
      border-radius: 6px;
      margin: 1rem 0;
      border: 1px solid #c3e6c3;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚠️ PrinceXML Setup Required</h1>
    
    <div class="notice">
      <strong>Notice:</strong> The PrinceXML binary is not installed or not found in your system PATH. 
      To enable PDF generation, please install PrinceXML and ensure it's accessible from the command line.
    </div>
    
    <h2>📋 Installation Steps:</h2>
    
    <div class="download-section">
      <strong>Download PrinceXML:</strong><br>
      Visit <a href="https://www.princexml.com/download/" target="_blank">https://www.princexml.com/download/</a> 
      to get the appropriate version for your operating system.
    </div>
    
    <div class="step">
      <strong>1.</strong> Download and install PrinceXML for your operating system
    </div>
    <div class="step">
      <strong>2.</strong> Ensure the <code>prince</code> command is available in your PATH
    </div>
    <div class="step">
      <strong>3.</strong> Test installation by running <code>prince --version</code> in your terminal
    </div>
    <div class="step">
      <strong>4.</strong> Restart the backend server: <code>npm run server</code>
    </div>
    <div class="step">
      <strong>5.</strong> Try generating the PDF again
    </div>
    
    <h2>📄 Your HTML Content Preview:</h2>
    <div class="content">
      ${html}
    </div>
    
    <p><em>This preview shows what would be converted to PDF once PrinceXML is properly installed.</em></p>
    
    <hr style="margin: 2rem 0; border: none; border-top: 1px solid #dee2e6;">
    <p style="text-align: center; color: #6c757d; font-size: 0.9rem;">
      Generated by Angular with PrinceXML integration
    </p>
  </div>
</body>
</html>`;

      // Return the HTML content with proper headers
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(instructionsHtml);
      return;
    }

    // If we reach here, PrinceXML binary is available, proceed with PDF generation
    try {
      const Prince = require('prince');
      const os = require('os');
      
      // Create a complete HTML document
      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Generated PDF</title>
  <style>
    @page {
      size: ${options.pageSize || 'letter'};
      margin: ${options.margins || '1in'};
    }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 8.5in;
    }
    h1, h2, h3 {
      color: #333;
      margin-top: 0;
    }
    div[style*="background: white"] {
      background: white !important;
      padding: 1.5rem;
      border-radius: 6px;
      border: 1px solid #dee2e6;
      margin-bottom: 1rem;
      break-inside: avoid;
    }
    p {
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

      // Create temporary files
      const tempDir = os.tmpdir();
      const inputFile = path.join(tempDir, `input-${Date.now()}.html`);
      const outputFile = path.join(tempDir, `output-${Date.now()}.pdf`);

      // Write HTML to temp file
      fs.writeFileSync(inputFile, fullHtml);

      // Generate PDF using Prince with explicit binary path
      let prince;
      try {
        // Try to find the Prince binary path
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        
        // Get the full path to prince executable
        let princePath;
        try {
          // On Heroku, use the vendor directory path (correct location)
          if (process.env.NODE_ENV === 'production' && process.env.DYNO) {
            const herokuPrincePath = '/app/vendor/prince/lib/prince/bin/prince';
            if (fs.existsSync(herokuPrincePath)) {
              princePath = herokuPrincePath;
              console.log('Using Heroku PrinceXML at:', princePath);
            } else {
              throw new Error('Heroku PrinceXML not found');
            }
          } else {
            // Local development or other environments
            const result = await execAsync(process.platform === 'win32' ? 'where prince' : 'which prince');
            princePath = result.stdout.trim().split('\n')[0];
            console.log('Found Prince binary at:', princePath);
          }
        } catch (pathError) {
          console.log('Could not find Prince binary path, using default');
          princePath = 'prince';
        }
        
        prince = Prince()
          .binary(princePath)
          .inputs(inputFile)
          .output(outputFile);

        await prince.execute();
      } catch (executeError) {
        console.log('Error with Prince binary path, trying alternative approach');
        // Fallback: try direct command execution
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        
        // Use the same logic for determining prince path
        let fallbackPrincePath = 'prince';
        if (process.env.NODE_ENV === 'production' && process.env.DYNO) {
          const herokuPrincePath = '/app/vendor/prince/bin/prince';
          if (fs.existsSync(herokuPrincePath)) {
            fallbackPrincePath = herokuPrincePath;
          }
        }
        
        const command = `"${fallbackPrincePath}" "${inputFile}" -o "${outputFile}"`;
        console.log('Executing command:', command);
        await execAsync(command);
      }

      // Read the generated PDF
      const pdfBuffer = fs.readFileSync(outputFile);

      // Clean up temp files
      fs.unlinkSync(inputFile);
      fs.unlinkSync(outputFile);

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', pdfBuffer.length);

      // Send PDF buffer
      res.send(pdfBuffer);

    } catch (princeError) {
      console.error('Error executing PrinceXML:', princeError);
      
      // Even if PrinceXML is installed but fails, provide helpful error
      res.status(500).json({ 
        error: 'PrinceXML execution failed', 
        details: princeError.message,
        suggestion: 'Please check that PrinceXML is properly installed and the prince binary is in your PATH'
      });
    }

  } catch (error) {
    console.error('Error in PDF generation endpoint:', error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
});

app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Note: Angular frontend is served by AWS Amplify, not from this backend

console.log('Routes configured...');

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Keep the process alive and handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('Server setup complete, attempting to start...');
