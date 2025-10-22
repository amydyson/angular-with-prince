import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrinceService } from './prince.service';

interface HtmlElement {
  id: string;
  type: 'heading' | 'paragraph' | 'card' | 'list';
  content?: string;
  title?: string;
  items?: string[];
}

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
  protected htmlElements = signal<HtmlElement[]>([]);
  private elementCounter = 0;

  async generatePDF(): Promise<void> {
    try {
      this.isGenerating.set(true);
      this.statusMessage.set('Generating PDF...');
      
      // Get the HTML content from the dynamic content area
      const dynamicContent = document.querySelector('.dynamic-content');
      if (dynamicContent) {
        const htmlContent = this.buildHtmlFromElements();
        console.log('HTML content to convert:', htmlContent);
        
        await this.princeService.generateAndDownloadPDF(htmlContent, 'sample-document.pdf');
        this.statusMessage.set('PDF downloaded successfully!');
        
        // Clear status after 3 seconds
        setTimeout(() => this.statusMessage.set(''), 3000);
      } else {
        console.error('Content area not found');
        this.statusMessage.set('Error: Content area not found');
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
      
      // Get the HTML content from the dynamic elements
      const htmlContent = this.buildHtmlFromElements();
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
    } catch (error) {
      console.error('Error previewing PDF:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.statusMessage.set(`Error previewing PDF: ${errorMessage}`);
    } finally {
      this.isGenerating.set(false);
    }
  }

  // HTML Builder Methods
  addHeading(): void {
    const newElement: HtmlElement = {
      id: `element-${++this.elementCounter}`,
      type: 'heading',
      content: 'New Heading'
    };
    this.htmlElements.update(elements => [...elements, newElement]);
  }

  addParagraph(): void {
    const newElement: HtmlElement = {
      id: `element-${++this.elementCounter}`,
      type: 'paragraph',
      content: 'This is a new paragraph. Click to edit this text.'
    };
    this.htmlElements.update(elements => [...elements, newElement]);
  }

  addCard(): void {
    const newElement: HtmlElement = {
      id: `element-${++this.elementCounter}`,
      type: 'card',
      title: 'Card Title',
      content: 'Card content goes here...'
    };
    this.htmlElements.update(elements => [...elements, newElement]);
  }

  addList(): void {
    const newElement: HtmlElement = {
      id: `element-${++this.elementCounter}`,
      type: 'list',
      items: ['First item', 'Second item', 'Third item']
    };
    this.htmlElements.update(elements => [...elements, newElement]);
  }

  clearAll(): void {
    this.htmlElements.set([]);
    this.elementCounter = 0;
  }

  removeElement(id: string): void {
    this.htmlElements.update(elements => elements.filter(el => el.id !== id));
  }

  updateElement(id: string, event: Event): void {
    const target = event.target as HTMLElement;
    const content = target.innerHTML;
    this.htmlElements.update(elements => 
      elements.map(el => el.id === id ? { ...el, content } : el)
    );
  }

  updateElementPart(id: string, part: 'title' | 'content', event: Event): void {
    const target = event.target as HTMLElement;
    const value = target.innerHTML;
    this.htmlElements.update(elements => 
      elements.map(el => el.id === id ? { ...el, [part]: value } : el)
    );
  }

  updateListItem(id: string, index: number, event: Event): void {
    const target = event.target as HTMLElement;
    const value = target.innerHTML;
    this.htmlElements.update(elements => 
      elements.map(el => {
        if (el.id === id && el.items) {
          const newItems = [...el.items];
          newItems[index] = value;
          return { ...el, items: newItems };
        }
        return el;
      })
    );
  }

  addListItem(id: string): void {
    this.htmlElements.update(elements => 
      elements.map(el => {
        if (el.id === id && el.items) {
          return { ...el, items: [...el.items, 'New item'] };
        }
        return el;
      })
    );
  }

  buildHtmlFromElements(): string {
    const elements = this.htmlElements();
    let html = '';

    elements.forEach(element => {
      switch (element.type) {
        case 'heading':
          html += `<h2 style="color: #333; margin-top: 0; margin-bottom: 1rem;">${element.content}</h2>`;
          break;
        case 'paragraph':
          html += `<p style="color: #666; line-height: 1.6; margin-bottom: 1rem;">${element.content}</p>`;
          break;
        case 'card':
          html += `
            <div style="background: white; padding: 1.5rem; border-radius: 6px; border: 1px solid #dee2e6; margin-bottom: 1rem;">
              <h3 style="margin-top: 0; color: #495057; margin-bottom: 0.5rem;">${element.title}</h3>
              <p style="color: #666; margin: 0;">${element.content}</p>
            </div>`;
          break;
        case 'list':
          html += '<ul style="margin-bottom: 1rem; padding-left: 1.5rem;">';
          element.items?.forEach(item => {
            html += `<li style="margin-bottom: 0.25rem; color: #666;">${item}</li>`;
          });
          html += '</ul>';
          break;
      }
    });

    return html || '<p style="color: #999; font-style: italic;">No content added yet. Use the buttons above to add elements.</p>';
  }
}
