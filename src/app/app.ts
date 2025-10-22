import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrinceService } from './prince.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('angular-with-prince');
  private princeService = inject(PrinceService);
  protected isGenerating = signal(false);
  protected statusMessage = signal('');

  async generatePDF(): Promise<void> {
    try {
      this.isGenerating.set(true);
      this.statusMessage.set('Generating PDF...');
      
      // Get the HTML content from the left column
      const leftColumn = document.querySelector('.content-column');
      if (leftColumn) {
        const htmlContent = leftColumn.innerHTML;
        console.log('HTML content to convert:', htmlContent);
        
        await this.princeService.generateAndDownloadPDF(htmlContent, 'sample-document.pdf');
        this.statusMessage.set('PDF downloaded successfully!');
        
        // Clear status after 3 seconds
        setTimeout(() => this.statusMessage.set(''), 3000);
      } else {
        console.error('Content column not found');
        this.statusMessage.set('Error: Content column not found');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.statusMessage.set(`Error generating PDF: ${errorMessage}`);
    } finally {
      this.isGenerating.set(false);
    }
  }

  async previewPDF(): Promise<void> {
    try {
      this.isGenerating.set(true);
      this.statusMessage.set('Generating PDF preview...');
      
      // Get the HTML content from the left column
      const leftColumn = document.querySelector('.content-column');
      if (leftColumn) {
        const htmlContent = leftColumn.innerHTML;
        console.log('HTML content to preview:', htmlContent);
        
        const pdfBlob = await this.princeService.generatePDF(htmlContent);
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        // Update the right column with PDF preview
        const rightColumn = document.querySelector('.pdf-preview');
        if (rightColumn) {
          rightColumn.innerHTML = `<iframe src="${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1" style="width: 100%; height: 100%; border: none; border-radius: 6px;"></iframe>`;
          this.statusMessage.set('PDF preview loaded successfully!');
          
          // Clear status after 3 seconds
          setTimeout(() => this.statusMessage.set(''), 3000);
        }
      } else {
        console.error('Content column not found');
        this.statusMessage.set('Error: Content column not found');
      }
    } catch (error) {
      console.error('Error previewing PDF:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.statusMessage.set(`Error previewing PDF: ${errorMessage}`);
    } finally {
      this.isGenerating.set(false);
    }
  }
}
