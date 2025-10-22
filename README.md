# Angular with PrinceXML

This project demonstrates how to create PDF documents from HTML using PrinceXML in an Angular application.

## Features

- 8.5" x 11" page layout with proper margins
- Print-optimized CSS with @page rules
- Professional document formatting
- Angular service for PDF generation
- Express server for PrinceXML conversion

## Prerequisites

1. **Node.js** (v18 or later)
2. **PrinceXML** installed on your system
   - Download from: https://www.princexml.com/download/
   - Follow installation instructions for your OS

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install additional server dependencies:
```bash
npm install express cors concurrently
```

## Running the Application

### Option 1: Run Angular and Server together
```bash
npm run dev
```

### Option 2: Run separately
```bash
# Terminal 1: Angular dev server
npm start

# Terminal 2: Express server for PDF conversion
npm run server
```

The Angular app will be available at `http://localhost:4200`
The PDF conversion API will be available at `http://localhost:3001`

## Usage

1. Open the application in your browser
2. Review the sample document in the left column
3. Use the controls in the right column:
   - **Generate PDF**: Creates HTML optimized for PrinceXML and sends it to the server for conversion
   - **Print Preview**: Shows how the document will look when printed

## Troubleshooting

### PrinceXML Not Found
- Ensure PrinceXML is properly installed and in your system PATH
- Check that the `prince` command works from the command line

### CORS Issues
- The server is configured to allow requests from `http://localhost:4200`
- Update the CORS configuration in `server.js` for production
