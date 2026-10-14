import html2pdf from 'html2pdf.js';

export async function downloadLetterAsPdf(
  letterHtmlOrUrl: string,
  filename: string
): Promise<void> {
  let content = letterHtmlOrUrl;

  // If it's an API view URL, fetch the HTML content
  if (content.startsWith('/api') || content.startsWith('http')) {
    try {
      const res = await fetch(content);
      const fullText = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(fullText, 'text/html');
      const inner = doc.querySelector('.container') || doc.querySelector('.legal-doc') || doc.body;
      content = inner.innerHTML;
    } catch (e) {
      console.warn('[PDF Download] Failed to fetch HTML by URL, opening print view', e);
      window.open(content, '_blank');
      return;
    }
  }

  const container = document.createElement('div');
  container.className = 'pdf-export-wrapper';
  container.innerHTML = content;

  // Remove any action bars or print buttons embedded in the document
  const actionBars = container.querySelectorAll('.action-bar');
  actionBars.forEach(el => el.remove());

  // Style container for clean A4 legal document export
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '210mm';
  container.style.padding = '15mm 20mm';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#000000';
  container.style.fontFamily = '"Times New Roman", Times, Georgia, serif';
  container.style.fontSize = '12pt';
  container.style.lineHeight = '1.35';

  const tables = container.querySelectorAll('table');
  tables.forEach(table => {
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
  });

  document.body.appendChild(container);

  try {
    const opt = {
      margin: [10, 10, 10, 10],
      filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    await (html2pdf as any)().set(opt).from(container).save();
  } catch (err) {
    console.error('[html2pdf error]:', err);
    if (letterHtmlOrUrl.startsWith('/api') || letterHtmlOrUrl.startsWith('http')) {
      window.open(letterHtmlOrUrl, '_blank');
    }
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
