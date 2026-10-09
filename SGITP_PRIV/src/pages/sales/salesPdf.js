
// Generador minimo de PDF (sin dependencias) para exportar el historial de ventas.
// Usa las fuentes base Helvetica con codificacion WinAnsi para soportar acentos.

const PAGE_WIDTH = 842; // A4 horizontal
const PAGE_HEIGHT = 595;
const MARGIN = 40;
const ROW_HEIGHT = 18;

const COLUMNS = [
  { label: 'ID VENTA', key: 'id', width: 70 },
  { label: 'FECHA', key: 'date', width: 120 },
  { label: 'CLIENTE', key: 'client', width: 130 },
  { label: 'ORIGEN', key: 'origin', width: 80 },
  { label: 'SUCURSAL', key: 'branch', width: 110 },
  { label: 'TIPO DE PRECIO', key: 'priceType', width: 85 },
  { label: 'ESTADO', key: 'paymentStatusLabel', width: 92 },
  { label: 'TOTAL', key: 'total', width: 75 },
];

const char = (code) => String.fromCharCode(code);
const SPACES_REGEX = new RegExp(`[${char(0xa0)}${char(0x202f)}]`, 'g');
const DASHES_REGEX = new RegExp(`[${char(0x2013)}${char(0x2014)}]`, 'g');
const NON_LATIN1_REGEX = new RegExp(`[^${char(0x20)}-${char(0x7e)}${char(0xa1)}-${char(0xff)}]`, 'g');

// Normaliza el texto a caracteres representables en WinAnsi (1 byte por caracter)
function toPdfText(value) {
  return String(value ?? '')
    .replace(SPACES_REGEX, ' ')
    .replace(DASHES_REGEX, '-')
    .replace(NON_LATIN1_REGEX, '?')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function fitText(value, width, fontSize) {
  const text = String(value ?? '');
  const maxChars = Math.floor(width / (fontSize * 0.52));
  return text.length > maxChars ? `${text.slice(0, Math.max(0, maxChars - 1))}.` : text;
}

function textCommand(text, x, y, size, bold = false) {
  return `BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${y} Td (${toPdfText(text)}) Tj ET`;
}

function buildPages({ sales, filtersSummary, totalAmount }) {
  const pages = [];
  let commands = [];
  let y = PAGE_HEIGHT - MARGIN;

  const drawHeader = (isFirstPage) => {
    if (isFirstPage) {
      commands.push(textCommand('Historial de ventas', MARGIN, y, 18, true));
      y -= 22;
      commands.push(
        textCommand(`Generado: ${new Date().toLocaleString('es-SV')}`, MARGIN, y, 9)
      );
      y -= 14;
      commands.push(textCommand(`Filtros: ${filtersSummary}`, MARGIN, y, 9));
      y -= 24;
    }

    let x = MARGIN;
    COLUMNS.forEach((column) => {
      commands.push(textCommand(column.label, x, y, 8, true));
      x += column.width;
    });
    commands.push(
      `0.6 w ${MARGIN} ${y - 5} m ${PAGE_WIDTH - MARGIN} ${y - 5} l S`
    );
    y -= ROW_HEIGHT;
  };

  drawHeader(true);

  if (sales.length === 0) {
    commands.push(textCommand('No hay ventas para los filtros seleccionados.', MARGIN, y, 9));
    y -= ROW_HEIGHT;
  }

  sales.forEach((sale) => {
    if (y < MARGIN + ROW_HEIGHT * 2) {
      pages.push(commands);
      commands = [];
      y = PAGE_HEIGHT - MARGIN;
      drawHeader(false);
    }

    let x = MARGIN;
    COLUMNS.forEach((column) => {
      commands.push(textCommand(fitText(sale[column.key], column.width - 6, 8), x, y, 8));
      x += column.width;
    });
    y -= ROW_HEIGHT;
  });

  commands.push(`0.6 w ${MARGIN} ${y + 10} m ${PAGE_WIDTH - MARGIN} ${y + 10} l S`);
  y -= 4;
  commands.push(
    textCommand(`Ventas: ${sales.length}    Monto total: ${totalAmount}`, MARGIN, y, 10, true)
  );
  pages.push(commands);

  return pages;
}

function buildPdf(pages) {
  const objects = [];
  const addObject = (content) => {
    objects.push(content);
    return objects.length;
  };

  const catalogId = addObject(null);
  const pagesId = addObject(null);
  const fontId = addObject(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
  );
  const boldFontId = addObject(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'
  );

  const pageIds = pages.map((commands) => {
    const stream = commands.join('\n');
    const contentId = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    return addObject(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
        `/Resources << /Font << /F1 ${fontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`
    );
  });

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] =
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

  let pdf = '%PDF-1.4\n';
  const offsets = objects.map((content, index) => {
    const offset = pdf.length;
    pdf += `${index + 1} 0 obj\n${content}\nendobj\n`;
    return offset;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  // Todos los caracteres son de 1 byte (latin1), por lo que los offsets coinciden
  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i += 1) {
    bytes[i] = pdf.charCodeAt(i) & 0xff;
  }
  return bytes;
}

export function createSalesPdf(options) {
  return buildPdf(buildPages(options));
}

export function downloadSalesPdf(options) {
  const blob = new Blob([createSalesPdf(options)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `historial-ventas-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
