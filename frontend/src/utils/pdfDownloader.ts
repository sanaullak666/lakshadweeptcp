import html2pdf from 'html2pdf.js';

function getHtml2Pdf(): any {
  if (typeof (html2pdf as any) === 'function') {
    return html2pdf;
  }
  if (typeof (html2pdf as any)?.default === 'function') {
    return (html2pdf as any).default;
  }
  if (typeof (window as any)?.html2pdf === 'function') {
    return (window as any).html2pdf;
  }
  return html2pdf;
}

export async function downloadLetterAsPdf(
  letterHtmlOrUrl: string,
  filename: string,
  serverDownloadUrl?: string
): Promise<void> {
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  let content = letterHtmlOrUrl;

  // If passed an API view or content URL, fetch HTML
  if (content.startsWith('/api') || content.startsWith('http')) {
    try {
      const res = await fetch(content);
      const fullText = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(fullText, 'text/html');
      const inner = doc.querySelector('.container') || doc.querySelector('.legal-doc') || doc.body;
      content = inner.innerHTML;
    } catch (e) {
      console.warn('[PDF Download] Failed to fetch HTML by URL, using server fallback', e);
      if (serverDownloadUrl) {
        triggerBrowserDownload(serverDownloadUrl, safeFilename);
        return;
      }
    }
  }

  // Create offscreen container within document coordinate space for html2canvas
  const container = document.createElement('div');
  container.className = 'pdf-export-wrapper';
  container.innerHTML = content;

  // Remove any action bars, buttons, or scripts
  const removeElements = container.querySelectorAll('.action-bar, button, script, iframe');
  removeElements.forEach(el => el.remove());

  // Style container for A4 printable layout
  container.style.position = 'absolute';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = '794px'; // 210mm in pixels at 96 DPI
  container.style.maxWidth = '794px';
  container.style.padding = '36px 48px';
  container.style.boxSizing = 'border-box';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#000000';
  container.style.fontFamily = '"Times New Roman", Times, Georgia, serif';
  container.style.fontSize = '12pt';
  container.style.lineHeight = '1.35';
  container.style.zIndex = '-99999';
  container.style.visibility = 'visible';
  container.style.opacity = '1';

  // Apply explicit inline styling to tables
  const tables = container.querySelectorAll('table');
  tables.forEach(table => {
    (table as HTMLElement).style.width = '100%';
    (table as HTMLElement).style.borderCollapse = 'collapse';
    (table as HTMLElement).style.margin = '14pt 0';
    (table as HTMLElement).style.fontSize = '10pt';
    (table as HTMLElement).style.lineHeight = '1.25';
  });

  const cells = container.querySelectorAll('th, td');
  cells.forEach(c => {
    (c as HTMLElement).style.border = '1px solid #000000';
    (c as HTMLElement).style.padding = '5pt 6pt';
    (c as HTMLElement).style.textAlign = 'left';
    (c as HTMLElement).style.verticalAlign = 'top';
  });

  const sigContainers = container.querySelectorAll('.signature-container');
  sigContainers.forEach(s => {
    (s as HTMLElement).style.height = '55px';
    (s as HTMLElement).style.maxWidth = '200px';
    (s as HTMLElement).style.margin = '4pt 0';
  });

  const sigImgs = container.querySelectorAll('.signature-container img');
  sigImgs.forEach(img => {
    (img as HTMLImageElement).style.maxHeight = '55px';
    (img as HTMLImageElement).style.maxWidth = '180px';
    (img as HTMLImageElement).style.objectFit = 'contain';
  });

  document.body.appendChild(container);

  try {
    const opt = {
      margin: [10, 10, 10, 10], // 10mm margins
      filename: safeFilename,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    const h2p = getHtml2Pdf();
    if (typeof h2p === 'function') {
      await h2p().set(opt).from(container).save();
    } else {
      throw new Error('html2pdf function not available');
    }
  } catch (err) {
    console.error('[html2pdf error, triggering server download fallback]:', err);
    if (serverDownloadUrl) {
      triggerBrowserDownload(serverDownloadUrl, safeFilename);
    }
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

function triggerBrowserDownload(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
