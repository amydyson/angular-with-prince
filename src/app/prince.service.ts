import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PrinceService {
  
  constructor() { }

  async generatePDF(htmlContent: string, options: any = {}): Promise<Blob> {
    try {
      console.log('Generating PDF with content:', htmlContent.substring(0, 100) + '...');
      
      // Send HTML content to backend for PDF generation
      const response = await fetch(`${environment.apiUrl}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: htmlContent,
          options: {
            pageSize: 'letter',
            orientation: 'portrait',
            margins: '1in',
            ...options
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }

      // Check the content type to determine if it's PDF or HTML
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('text/html')) {
        // This is an HTML response (PrinceXML not available)
        const htmlResponse = await response.text();
        console.warn('PrinceXML not available, received HTML instructions');
        
        // Create blob with HTML content
        const blob = new Blob([htmlResponse], { type: 'text/html' });
        console.log('HTML instructions generated, size:', blob.size, 'bytes');
        return blob;
        
      } else if (contentType.includes('application/json')) {
        // This is a JSON error response
        const jsonResponse = await response.json();
        console.warn('Received JSON response:', jsonResponse);
        
        // Create a simple HTML page from the JSON response
        const htmlPage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PDF Generation Error</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 2rem; line-height: 1.6; max-width: 800px; margin: 0 auto; }
    .error { background: #f8d7da; border: 1px solid #f5c6cb; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; color: #721c24; }
    .content { background: #f8f9fa; padding: 1rem; border-radius: 4px; margin-top: 1rem; }
    h1 { color: #e17055; }
  </style>
</head>
<body>
  <h1>⚠️ PDF Generation Error</h1>
  
  <div class="error">
    <strong>Error:</strong> ${jsonResponse.message || jsonResponse.error}
    ${jsonResponse.suggestion ? `<br><strong>Suggestion:</strong> ${jsonResponse.suggestion}` : ''}
  </div>
  
  <h2>📄 Your HTML Content:</h2>
  <div class="content">
    ${jsonResponse.htmlContent || htmlContent}
  </div>
</body>
</html>`;
        
        const blob = new Blob([htmlPage], { type: 'text/html' });
        console.log('Error page generated, size:', blob.size, 'bytes');
        return blob;
        
      } else {
        // This should be a PDF response
        const blob = await response.blob();
        console.log('PDF generated successfully, size:', blob.size, 'bytes');
        return blob;
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  downloadPDF(blob: Blob, filename: string = 'document.pdf'): void {
    try {
      // Check if it's HTML (mock response) or PDF
      if (blob.type === 'text/html') {
        // For HTML preview, change filename to .html
        filename = filename.replace('.pdf', '.html');
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('File download initiated:', filename);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  async generateAndDownloadPDF(htmlContent: string, filename: string = 'document.pdf', options: any = {}): Promise<void> {
    try {
      const blob = await this.generatePDF(htmlContent, options);
      this.downloadPDF(blob, filename);
    } catch (error) {
      console.error('Error generating and downloading PDF:', error);
      throw error;
    }
  }
}
