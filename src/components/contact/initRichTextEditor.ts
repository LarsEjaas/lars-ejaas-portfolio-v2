import { exec, init, type PellElement } from 'pell';
import { initializeKeyboardArrowNavigation } from '@utils/keyboardArrowNavigation';
import styles from './contact.module.css';

class PellRichTextEditor {
  private editor: (HTMLDivElement & PellElement) | undefined;
  private richTextElement: HTMLDivElement;
  private textArea: HTMLTextAreaElement;
  private lang: string;

  constructor(richTextElement: HTMLDivElement, textArea: HTMLTextAreaElement) {
    this.richTextElement = richTextElement;
    this.textArea = textArea;
    this.lang = richTextElement.dataset.lang || 'en';

    // Bind methods to preserve 'this' context
    this.handlePaste = this.handlePaste.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.initialize = this.initialize.bind(this);
  }

  private async handlePaste() {
    const isSecureContext = window.location.protocol
      .toLowerCase()
      .includes('https');

    if (!isSecureContext) {
      console.warn(
        'Paste is not available - please use keyboard shortcut Ctrl+V/Cmd+V'
      );
      window.alert(
        this.lang === 'en'
          ? 'Paste from clipboard is not available - please use keyboard shortcut Ctrl+V / Cmd+V instead.'
          : 'Indsæt fra udklipsholderen er ikke tilgængelig - benyt tastatur-genvejen Ctrl + V / Cmd + V istedet.'
      );
      return false;
    }

    try {
      if ('permissions' in navigator) {
        const queryOpts = {
          name: 'clipboard-read' as PermissionName,
          allowWithoutGesture: false,
        };
        const permissionStatus = await navigator.permissions.query(queryOpts);

        console.info(
          `Clipboard-read permission state: ${permissionStatus.state}`
        );

        if (permissionStatus.state === 'denied') {
          window.alert(
            this.lang === 'en'
              ? 'Clipboard access denied. Please enable clipboard permissions in your browser.'
              : 'Adgang til udklipsholderen er blokeret. Giv tilladelse til klipsholderen i din browser for at indsætte tekst.'
          );
          return false;
        }

        permissionStatus.onchange = () => {
          console.info(
            `Clipboard-read permission changed to: ${permissionStatus.state}`
          );
        };
      }

      if ('clipboard' in navigator) {
        const text = await navigator.clipboard.readText();
        return exec('insertText', text);
      }
    } catch (err) {
      console.error('Paste failed:', err);
      return false;
    }
  }

  private handleChange(html: string) {
    if (html === '' || html === '<p><br></p>') {
      this.textArea.innerHTML = '';
    } else {
      this.textArea.innerHTML = html;
    }
  }

  private setupEditorUI() {
    // Make sure the rich text editor is accessible
    this.richTextElement.style.display = 'block';
    this.richTextElement.querySelectorAll('button').forEach((button) => {
      button.dataset.arrowNav = 'true';
      button.ariaLabel = button.title;
    });

    // Add line break after align right button
    const alignRightButton = this.richTextElement.querySelector(
      'button[aria-label="Align Right"], button[aria-label="Højrejusteret"]'
    );
    const strikethroughButton = this.richTextElement.querySelector(
      'button[aria-label="Strikethrough"], button[aria-label="Gennemstreget"]'
    );
    const horizontalLineButton = this.richTextElement.querySelector(
      'button[aria-label="Horizontal Line"], button[aria-label="Vandret linje"]'
    );

    if (alignRightButton && strikethroughButton && horizontalLineButton) {
      const lineBreakElement1 = document.createElement('div');
      lineBreakElement1.className = styles.pellBreak || '';
      alignRightButton.after(lineBreakElement1);
      const lineBreakElement2 = document.createElement('div');
      lineBreakElement2.className = styles.pellBreak || '';
      strikethroughButton.after(lineBreakElement2);
      const lineBreakElement3 = document.createElement('div');
      lineBreakElement3.className = styles.pellBreak || '';
      horizontalLineButton.after(lineBreakElement3);
    }

    // Hide textarea when JS is enabled
    this.textArea.style.minHeight = '0';
    this.textArea.style.height = '0';
    this.textArea.style.padding = '0';
    this.textArea.style.border = 'unset';
    this.textArea.style.position = 'absolute';
    this.textArea.tabIndex = -1;
  }

  private removeColorStyling = (
    node: Node,
    exec: (command: string, value?: string) => void,
    type: 'color' | 'bgcolor' | 'all'
  ) => {
    if (node.nodeType === 1 && node instanceof HTMLElement) {
      if (node.hasAttribute(type)) {
        node.removeAttribute(type);
      }
      if (type === 'all') {
        if (node.hasAttribute('bgcolor')) {
          node.removeAttribute('bgcolor');
        }
        if (node.hasAttribute('color')) {
          node.removeAttribute('color');
        }
        if (node.hasAttribute('style')) {
          node.removeAttribute('style');
        }
      }

      Array.from(node.childNodes).forEach((childNode) => {
        if (childNode) {
          this.removeColorStyling(childNode, exec, type);
        }
      });
    }
  };

  private removeFormating = (
    node: Node,
    selection: Selection,
    exec: (command: string, value?: string) => void
  ) => {
    if (node.nodeType !== 1) return;
    const element = node as HTMLElement;

    if (element.style && element.style.color) {
      const range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);

      exec('removeFormat');
    }

    Array.from(element.children).forEach((element) =>
      this.removeFormating(element, selection, exec)
    );
  };

  public initialize() {
    this.richTextElement.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
    };
    this.editor = init({
      element: this.richTextElement,
      defaultParagraphSeparator: 'div',
      styleWithCSS: false,
      onChange: this.handleChange,
      actions: [
        {
          name: 'bold',
          icon: `<svg width="18"height="18" viewBox="0 0 24 24" fill="none">
            <path stroke="currentColor" stroke-linecap="round"  stroke-width="2" d="M6 12h8a4 4 0 0 0 0-8H6v8Zm0 0h9a4 4 0 0 1 0 8H6v-8Z"/>
            </svg>`,
          title: this.lang === 'en' ? 'Bold' : 'Fed',
          result: () => exec('bold'),
        },
        {
          name: 'italic',
          icon: `<svg width="18"height="18" viewBox="0 0 24 24" fill="none">
            <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M19 4h-9m4 16H5M15 4 9 20"/>
            </svg>`,
          title: this.lang === 'en' ? 'Italic' : 'Kursiv',
          result: () => exec('italic'),
        },
        {
          name: 'underline',
          icon: `<svg width="18"height="18" viewBox="0 0 24 24" fill="none">
            <path stroke="currentColor" stroke-linecap="round"  stroke-width="2" d="M18 4v7a6 6 0 0 1-12 0V4M4 21h16"/>
            </svg>`,
          title: this.lang === 'en' ? 'Underline' : 'Understreget',
          result: () => exec('underline'),
        },
        {
          name: 'strikethrough',
          icon: `<svg width="18"height="18" viewBox="0 0 24 24" fill="none">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 16c0 2 2 4 4 4h4a4 4 0 0 0 0-8m-3 8a4 4 0 0 0 0-8m7-4c0-2-2-4-4-4h-4C8 4 6 6 6 8m8-4c-3 0-4 2-4 4m-7 4h18"/>
            </svg>`,
          title: this.lang === 'en' ? 'Strikethrough' : 'Gennemstreget',
          result: () => exec('strikethrough'),
        },
        {
          name: 'heading1',
          icon: `<svg width="18"height="18" viewBox="0 0 24 24" fill="none">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4v16M18 4v16M8 4H4m14 8H6m2 8H4m16 0h-4m4-16h-4"/>
            </svg>`,
          title: this.lang === 'en' ? 'Heading 1' : 'Overskrift 1',
          result: () => exec('formatBlock', '<h1>'),
        },
        {
          name: 'heading2',
          icon: `<svg width="18"height="18" viewBox="0 0 24 24" fill="none">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4v16M18 4v16M10 4v16m2-16H4m14 8h-8m2 8H4m16 0h-4m4-16h-4"/>
            </svg>`,
          title: this.lang === 'en' ? 'Heading 2' : 'Overskrift 2',
          result: () => exec('formatBlock', '<h2>'),
        },
        {
          name: 'paragraph',
          icon: `<svg width="18"height="18" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.5 4v16m2-16H9a4 4 0 1 0 0 8h5m0-8v16m-2 0h7.5"/>
            </svg>`,
          title: this.lang === 'en' ? 'Paragraph' : 'Afsnit',
          result: () => exec('formatBlock', '<p>'),
        },
        {
          name: 'quote',
          icon: `<svg width="18"height="18" viewBox="0 0 16 16">
            <path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 9 7.558V11a1 1 0 0 0 1 1h2Zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 3 7.558V11a1 1 0 0 0 1 1h2Z" fill="currentColor"/>
            </svg>`,
          title: this.lang === 'en' ? 'Quote' : 'Citat',
          result: () => exec('formatBlock', '<blockquote>'),
        },
        {
          name: 'orderedList',
          icon: `<svg width="18"height="18" viewBox="0 0 24 24" fill="none">
            <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M21 12H9m12-6H9m12 12H9"/>
            <path fill="currentColor" d="m3.8 4.1-.4.6-.8.4v.8a3.2 3.2 0 0 0 1-.5v2.4h1V4h-.8zm.2 6a2 2 0 0 0-.8.1 1 1 0 0 0-.4.4l-.2.7h1l.1-.4.3-.1.3.1.1.3v.3l-.6.5a4 4 0 0 0-1 1c-.2.2-.3.5-.3.8h3v-.9H3.9a4.4 4.4 0 0 1 .6-.5l.7-.6.2-.7c0-.2 0-.3-.2-.5a1 1 0 0 0-.4-.4l-.9-.1zm0 5.6a2 2 0 0 0-1.1.3c-.2.1-.4.4-.5.8l1 .1.3-.4.3-.1.3.1.1.3-.1.3-.4.2h-.2v.8h.7l.2.5c0 .2 0 .4-.2.5l-.3.1h-.4l-.2-.6-1.1.2.3.6.5.4 1 .1.9-.1c.2-.2.4-.3.5-.6l.2-.6-.1-.5c0-.2-.2-.3-.3-.4l-.4-.1.4-.4.2-.5a1 1 0 0 0-.4-.7c-.2-.2-.6-.3-1.2-.3z"/>
            </svg>`,
          title: this.lang === 'en' ? 'Numbered List' : 'Nummereret liste',
          result: () => exec('insertOrderedList'),
        },
        {
          name: 'bulletList',
          icon: `<svg width="18"height="18" viewBox="0 0 24 24" fill="none">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12H9m12-6H9m12 12H9m-4-6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm0-6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm0 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/>
            </svg>`,
          title: this.lang === 'en' ? 'Bullet List' : 'Punktopstilling',
          result: () => exec('insertUnorderedList'),
        },
        {
          name: 'code',
          icon: `<svg width="18"height="18" viewBox="0 0 24 24" fill="none">
            <path d="M17 17L22 12L17 7M7 7L2 12L7 17M14 3L10 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>`,
          title: this.lang === 'en' ? 'Code' : 'Kode',
          result: () => exec('formatBlock', '<pre>'),
        },
        {
          name: 'line',
          icon: `<svg width="18"height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12H20" stroke="currentColor" stroke-linecap="round" stroke-width="2"/>
            </svg>`,
          title: this.lang === 'en' ? 'Horizontal Line' : 'Vandret linje',
          result: () => exec('insertHorizontalRule'),
        },
        {
          name: 'left',
          icon: `<svg width="18"height="18" fill="none" viewBox="0 0 24 24">
             <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 10H3m17-4H3m17 8H3m13 4H3"/>
            </svg>
            `,
          title: this.lang === 'en' ? 'Align Left' : 'Venstrejusteret',
          result: () => exec('justifyLeft'),
        },
        {
          name: 'center',
          icon: `<svg width="18"height="18" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 10H6m15-4H3m18 8H3m15 4H6"/>
            </svg>
            `,
          title: this.lang === 'en' ? 'Align Center' : 'Centreret',
          result: () => exec('justifyCenter'),
        },
        {
          name: 'right',
          icon: `<svg width="18"height="18" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H8m13-4H4m17 8H4m17 4H8"/>
            </svg>
            `,
          title: this.lang === 'en' ? 'Align Right' : 'Højrejusteret',
          result: () => exec('justifyRight'),
        },
        {
          name: 'selectAll',
          icon: `<svg width="18"height="18" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8V5.2c0-1.1 0-1.7-.2-2.1a2 2 0 0 0-.9-.9c-.4-.2-1-.2-2.1-.2H5.2c-1.1 0-1.7 0-2.1.2a2 2 0 0 0-.9.9C2 3.5 2 4 2 5.2v7.6c0 1.1 0 1.7.2 2.1.2.4.5.7.9.9.4.2 1 .2 2.1.2H8m4-1 2 2 4.5-4.5M11.2 22h7.6c1.1 0 1.7 0 2.1-.2.4-.2.7-.5.9-.9.2-.4.2-1 .2-2.1v-7.6c0-1.1 0-1.7-.2-2.1a2 2 0 0 0-.9-.9c-.4-.2-1-.2-2.1-.2h-7.6c-1.1 0-1.7 0-2.1.2a2 2 0 0 0-.9.9c-.2.4-.2 1-.2 2.1v7.6c0 1.1 0 1.7.2 2.1.2.4.5.7.9.9.4.2 1 .2 2.1.2Z"/>
            </svg>
            `,
          title: this.lang === 'en' ? 'Select All' : 'Vælg alt',
          result: () => exec('selectAll'),
        },
        {
          name: 'clearAll',
          icon: `<svg width="18"height="18" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 14H3m18-8H3m10 12H3m18-8H3m13 8 5-5m0 5-5-5"/>
            </svg>`,
          title: this.lang === 'en' ? 'Clear All' : 'Ryd alt',
          result: () => {
            if (this.editor) {
              this.handleChange('');
              return (this.editor.content.innerHTML = '<p><br></p>');
            }
            return false;
          },
        },
        {
          name: 'removeBackgroundColor',
          icon: `<svg width="18"height="18" viewBox="0 0 24 24" fill="none">
            <g stroke="currentColor" stroke-linecap="round" stroke-width="2">
            <path d="m10 22 2 .2a3 3 0 0 0 3-3v-1.4a3 3 0 0 1 2.6-2.6H19a3 3 0 0 0 3-3 10 10 0 0 0-10-10 10 10 0 0 0-9.8 12M2 17l5 5m0-5-5 5"/>
            <path d="M7 13c.6 0 1-.5 1-1s-.5-1-1-1-1 .5-1 1 .5 1 1 1zm9-4c.6 0 1-.5 1-1s-.5-1-1-1-1 .5-1 1 .5 1 1 1zm-6-1c.6 0 1-.5 1-1s-.5-1-1-1c-.6 0-1 .5-1 1s.5 1 1 1z"/>
            </g>
            </svg>`,
          title:
            this.lang === 'en'
              ? 'Remove Background Color'
              : 'Fjern baggrundsfarve',
          result: () => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            const commonAncestor = range.commonAncestorContainer;
            exec('backColor', 'unset');

            if (commonAncestor.nodeType === 1) {
              this.removeColorStyling(commonAncestor, exec, 'bgcolor');
              return;
            }
            if (commonAncestor.parentNode) {
              this.removeColorStyling(
                commonAncestor.parentNode,
                exec,
                'bgcolor'
              );
            }
          },
        },
        {
          name: 'removeTextColor',
          icon: `<svg width="18"height="18" viewBox="0 0 24 24" fill="none">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 10V8.4M12 2H7.6l-1 .1a1 1 0 0 0-.5.4L6 3.6V10m12 0H6m12 0v.2c0 1.7 0 2.5-.3 3.2a3 3 0 0 1-1.3 1.3c-.7.3-1.5.3-3.2.3h-2.4c-1.7 0-2.5 0-3.2-.3a3 3 0 0 1-1.3-1.3c-.3-.7-.3-1.5-.3-3.2V10m8.5 5v4.5c0 3.3-5 3.3-5 0V15M15 2l5 5m0-5-5 5"/>
            </svg>`,
          title: this.lang === 'en' ? 'Remove Text Color' : 'Fjern textfarve',
          result: () => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) {
              return;
            }
            const range = selection?.getRangeAt(0);
            const commonAncestor = range.commonAncestorContainer;
            exec('foreColor', 'unset');

            if (commonAncestor.nodeType === 1) {
              this.removeColorStyling(commonAncestor, exec, 'color');
              return;
            }
            if (commonAncestor.parentNode) {
              this.removeColorStyling(commonAncestor.parentNode, exec, 'color');
            }
          },
        },
        {
          name: 'removeFormating',
          icon: `<svg width="18"height="18" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m18 13-7-7m10 15H8m3-1 8.6-8.6c1.2-1.2 1.8-1.8 2-2.5a3 3 0 0 0 0-1.8c-.2-.7-.8-1.3-2-2.5l-.2-.2c-1.2-1.2-1.8-1.8-2.5-2a3 3 0 0 0-1.8 0c-.7.2-1.3.8-2.5 2l-8.2 8.2c-1.2 1.2-1.8 1.8-2 2.5a3 3 0 0 0 0 1.8c.2.7.8 1.3 2 2.5l.7.7.7.6.6.2 1 .1h2.3l.5-.3.7-.6Z"/>
            </svg>
            `,
          title: this.lang === 'en' ? 'Remove Formating' : 'Fjern formatering',
          result: () => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            const commonAncestor = range.commonAncestorContainer;
            exec('removeFormat');

            if (commonAncestor.nodeType === 1) {
              this.removeColorStyling(commonAncestor, exec, 'all');
              return;
            }
            if (commonAncestor.parentNode) {
              this.removeColorStyling(commonAncestor.parentNode, exec, 'all');
            }
          },
        },
        {
          name: 'paste',
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" >
            <path stroke="currentColor" stroke-width="2" d="M16 4h2l2 2v14l-2 2H6l-2-2V6l2-2h2m2 2h5l1-1V4v0-1l-1-1H9L8 3v2l1 1h1Z"/>
            </svg>`,
          title:
            this.lang === 'en'
              ? 'Paste from clipboard'
              : 'Indsæt fra udklipsholder',
          result: () => this.handlePaste(),
        },
        {
          name: 'undo',
          icon: `<svg width="18"height="18" viewBox="0 0 24 24" fill="none">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9h13.5a4.5 4.5 0 1 1 0 9H12M3 9l4-4M3 9l4 4"/>
            </svg>`,
          title: this.lang === 'en' ? 'Undo' : 'Fortryd',
          result: () => exec('undo'),
        },
        {
          name: 'redo',
          icon: `<svg width="18"height="18" viewBox="0 0 24 24" fill="none">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 9H7.5a4.5 4.5 0 1 0 0 9H12m9-9-4-4m4 4-4 4"/>
            </svg>`,
          title: this.lang === 'en' ? 'Redo' : 'Gentag',
          result: () => exec('redo'),
        },
      ],
      classes: {
        actionbar: styles.pellActionbar,
        button: styles.pellButton,
        content: styles.pellContent,
        selected: styles.pellSelected,
      },
    });

    this.setupEditorUI();
    initializeKeyboardArrowNavigation(this.richTextElement);
    this.richTextElement.ariaKeyShortcuts = 'ArrowLeft ArrowRight';

    // Set initial content
    this.editor.content.innerHTML = '<p><br></p>';
  }
}

export function initializeRichTextEditor() {
  const richTextEditor = window.richtextEditor;
  const textArea = window.contactTextArea;

  if (richTextEditor && textArea) {
    document.addEventListener('DOMContentLoaded', () => {
      const editor = new PellRichTextEditor(richTextEditor, textArea);
      editor.initialize();
    });
  }
}
