
// Generador minimo de PDF (sin dependencias) para exportar el historial de ventas.
// Usa las fuentes base Helvetica con codificacion WinAnsi para soportar acentos.

const PAGE_WIDTH = 842; // A4 horizontal
const PAGE_HEIGHT = 595;
const MARGIN = 28;
const TABLE_WIDTH = PAGE_WIDTH - MARGIN * 2;
const ROW_HEIGHT = 24;
const HEADER_HEIGHT = 28;
const FONT_SIZE = 11;
const HEADER_FONT_SIZE = 11;
const CELL_PADDING = 6;

// Anchos relativos; se escalan para ocupar todo el ancho util de la pagina
const COLUMN_WEIGHTS = [
  { label: 'ID VENTA', key: 'id', weight: 70 },
  { label: 'FECHA', key: 'date', weight: 140 },
  { label: 'CLIENTE', key: 'client', weight: 130 },
  { label: 'ORIGEN', key: 'origin', weight: 90 },
  { label: 'SUCURSAL', key: 'branch', weight: 110 },
  { label: 'TIPO DE PRECIO', key: 'priceType', weight: 120 },
  { label: 'ESTADO', key: 'paymentStatusLabel', weight: 115 },
  { label: 'TOTAL', key: 'total', weight: 75 },
];
const TOTAL_WEIGHT = COLUMN_WEIGHTS.reduce((sum, column) => sum + column.weight, 0);
const COLUMNS = COLUMN_WEIGHTS.map((column) => ({
  ...column,
  width: (column.weight / TOTAL_WEIGHT) * TABLE_WIDTH,
}));

// Anchos de glifo (1/1000 em) de Helvetica y Helvetica-Bold para caracteres 32-126
const HELVETICA_WIDTHS = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];
const HELVETICA_BOLD_WIDTHS = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
  333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
  611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
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

const round = (value) => Math.round(value * 100) / 100;

// Mide el ancho real del texto en puntos para poder centrarlo
function textWidth(text, size, bold = false) {
  const widths = bold ? HELVETICA_BOLD_WIDTHS : HELVETICA_WIDTHS;
  const normalized = String(text ?? '').replace(SPACES_REGEX, ' ').replace(DASHES_REGEX, '-');
  let total = 0;
  for (const letter of normalized) {
    const code = letter.charCodeAt(0);
    total += code >= 32 && code <= 126 ? widths[code - 32] : 556;
  }
  return (total * size) / 1000;
}

function fitText(value, width, size, bold = false) {
  let text = String(value ?? '');
  if (textWidth(text, size, bold) <= width) return text;
  while (text.length > 0 && textWidth(`${text}...`, size, bold) > width) {
    text = text.slice(0, -1);
  }
  return `${text.trimEnd()}...`;
}

function textCommand(text, x, y, size, bold = false) {
  return `BT /${bold ? 'F2' : 'F1'} ${size} Tf ${round(x)} ${round(y)} Td (${toPdfText(text)}) Tj ET`;
}

// Texto centrado horizontalmente dentro de un rango [x, x + width]
function centeredText(text, x, width, y, size, bold = false) {
  const fitted = fitText(text, width, size, bold);
  return textCommand(fitted, x + (width - textWidth(fitted, size, bold)) / 2, y, size, bold);
}

function rectCommand(x, y, width, height, gray) {
  return `${gray} g ${round(x)} ${round(y)} ${round(width)} ${round(height)} re f 0 g`;
}

function lineCommand(y, gray = 0.75) {
  return `${gray} G 0.5 w ${MARGIN} ${round(y)} m ${PAGE_WIDTH - MARGIN} ${round(y)} l S 0 G`;
}

function buildPages({ sales, filtersSummary, totalAmount }) {
  const pages = [];
  let commands = [];
  let y = PAGE_HEIGHT - MARGIN;

  const drawTableHeader = () => {
    commands.push(rectCommand(MARGIN, y - HEADER_HEIGHT, TABLE_WIDTH, HEADER_HEIGHT, 0.88));
    let x = MARGIN;
    COLUMNS.forEach((column) => {
      commands.push(
        centeredText(
          column.label,
          x + CELL_PADDING,
          column.width - CELL_PADDING * 2,
          y - HEADER_HEIGHT / 2 - HEADER_FONT_SIZE * 0.35,
          HEADER_FONT_SIZE,
          true
        )
      );
      x += column.width;
    });
    y -= HEADER_HEIGHT;
  };

  // Encabezado del documento (solo primera pagina)
  commands.push(centeredText('Historial de ventas', MARGIN, TABLE_WIDTH, y - 20, 22, true));
  y -= 42;
  commands.push(
    centeredText(`Generado: ${new Date().toLocaleString('es-SV')}`, MARGIN, TABLE_WIDTH, y, 12)
  );
  y -= 18;
  commands.push(centeredText(`Filtros: ${filtersSummary}`, MARGIN, TABLE_WIDTH, y, 12));
  y -= 20;

  drawTableHeader();

  const drawRow = (values, bold = false) => {
    let x = MARGIN;
    values.forEach((value, index) => {
      const column = COLUMNS[index];
      commands.push(
        centeredText(
          value,
          x + CELL_PADDING,
          column.width - CELL_PADDING * 2,
          y - ROW_HEIGHT / 2 - FONT_SIZE * 0.35,
          FONT_SIZE,
          bold
        )
      );
      x += column.width;
    });
    y -= ROW_HEIGHT;
    commands.push(lineCommand(y));
  };

  if (sales.length === 0) {
    commands.push(
      centeredText(
        'No hay ventas para los filtros seleccionados.',
        MARGIN,
        TABLE_WIDTH,
        y - ROW_HEIGHT / 2 - FONT_SIZE * 0.35,
        FONT_SIZE
      )
    );
    y -= ROW_HEIGHT;
    commands.push(lineCommand(y));
  }

  sales.forEach((sale) => {
    if (y - ROW_HEIGHT < MARGIN + 20) {
      pages.push(commands);
      commands = [];
      y = PAGE_HEIGHT - MARGIN;
      drawTableHeader();
    }
    drawRow(COLUMNS.map((column) => sale[column.key]));
  });

  // Resumen final; si no cabe pasa a una nueva pagina
  if (y - 34 < MARGIN + 20) {
    pages.push(commands);
    commands = [];
    y = PAGE_HEIGHT - MARGIN;
  }
  y -= 26;
  commands.push(
    centeredText(
      `Ventas: ${sales.length}      Monto total: ${totalAmount}`,
      MARGIN,
      TABLE_WIDTH,
      y,
      14,
      true
    )
  );
  pages.push(commands);

  // Numeracion de paginas centrada al pie
  pages.forEach((pageCommands, index) => {
    pageCommands.push(
      centeredText(`Página ${index + 1} de ${pages.length}`, MARGIN, TABLE_WIDTH, MARGIN - 8, 10)
    );
  });

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
