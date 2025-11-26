/**
 * CV PDF Generator
 * Generates a PDF version of the CV from JSON data files using pdfmake and citation-js.
 * Run with: bun scripts/generate-cv-pdf.ts
 */

import PdfPrinter from 'pdfmake';
import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Import data files
import educationData from '../src/data/education.json';
import publicationsData from '../src/data/publications.json';
import presentationsData from '../src/data/presentations.json';
import awardsData from '../src/data/awards.json';

// Import citation-js
// @ts-expect-error citation-js does not ship official TypeScript types
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-csl';

// Import types
import type { Education, Award, CSLPublication, CSLPresentation } from '../src/types/data';

// Type the imported data
const typedEducationData = educationData as Education[];
const typedPublicationsData = publicationsData.items as CSLPublication[];
const typedPresentationsData = presentationsData as CSLPresentation[];
const typedAwardsData = awardsData.awardsAndFellowships as Award[];

// Define fonts for pdfmake (using roboto-fontface woff files)
const fonts = {
  Roboto: {
    normal: join(import.meta.dirname, '../node_modules/roboto-fontface/fonts/roboto/Roboto-Regular.woff'),
    bold: join(import.meta.dirname, '../node_modules/roboto-fontface/fonts/roboto/Roboto-Medium.woff'),
    italics: join(import.meta.dirname, '../node_modules/roboto-fontface/fonts/roboto/Roboto-RegularItalic.woff'),
    bolditalics: join(import.meta.dirname, '../node_modules/roboto-fontface/fonts/roboto/Roboto-MediumItalic.woff'),
  },
};

const printer = new PdfPrinter(fonts);

/**
 * Extract year from CSL date object
 */
function getYearFromCSLDate(date?: { 'date-parts'?: (number | string)[][] }): number | undefined {
  const firstPart = date?.['date-parts']?.[0]?.[0];
  if (firstPart == null) return undefined;
  if (typeof firstPart === 'number') return firstPart;
  const parsed = parseInt(String(firstPart), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * Format a citation using citation-js (text format for PDF)
 */
function formatCitation(item: CSLPublication | CSLPresentation): string {
  try {
    const cite = new Cite([item]);
    // Use text format for PDF (no HTML tags)
    const formatted = cite.format('bibliography', {
      format: 'text',
      template: 'apa',
      lang: 'en-US',
    });
    // Clean up the output (remove extra whitespace, newlines)
    return formatted.trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
  } catch (error) {
    console.error('Error formatting citation:', error);
    // Fallback formatting
    const title = item.title || '';
    const year = getYearFromCSLDate(item.issued) ?? '';
    return `${title} (${year})`;
  }
}

/**
 * Build the Education section
 */
function buildEducationSection(): Content[] {
  const content: Content[] = [
    { text: 'Education', style: 'sectionHeader' },
  ];

  for (const edu of typedEducationData) {
    content.push({
      columns: [
        { text: edu.degreeName, style: 'itemTitle', width: '*' },
        { text: `${edu.startDate} - ${edu.endDate}`, style: 'itemDate', width: 'auto', alignment: 'right' },
      ],
      margin: [0, 8, 0, 0],
    } as Content);
    content.push({ text: edu.schoolName, style: 'itemSubtitle' } as Content);
    if (edu.notes) {
      content.push({ text: edu.notes, style: 'itemNotes' } as Content);
    }
  }

  return content;
}

/**
 * Build the Publications section
 */
function buildPublicationsSection(): Content[] {
  const content: Content[] = [
    { text: 'Publications', style: 'sectionHeader', pageBreak: 'before' },
  ];

  // Filter out excluded publications and sort by year descending
  const filtered = typedPublicationsData
    .filter((pub) => !pub.custom?.exclude)
    .sort((a, b) => {
      const yearA = getYearFromCSLDate(a.issued) ?? 0;
      const yearB = getYearFromCSLDate(b.issued) ?? 0;
      return yearB - yearA;
    });

  for (const pub of filtered) {
    const formatted = formatCitation(pub);
    // Hanging indent: indent all lines, then pull first line back
    content.push({
      text: formatted,
      style: 'citation',
      margin: [18, 6, 0, 0],
      leadingIndent: -18,
    } as Content);
  }

  return content;
}

/**
 * Build the Presentations section
 */
function buildPresentationsSection(): Content[] {
  const content: Content[] = [
    { text: 'Presentations', style: 'sectionHeader', pageBreak: 'before' },
  ];

  // Sort by year descending
  const sorted = [...typedPresentationsData].sort((a, b) => {
    const yearA = getYearFromCSLDate(a.issued) ?? 0;
    const yearB = getYearFromCSLDate(b.issued) ?? 0;
    return yearB - yearA;
  });

  // Group by section
  const grouped = sorted.reduce((acc, pres) => {
    const section = pres.custom?.section || 'Presentations';
    if (!acc[section]) acc[section] = [];
    acc[section].push(pres);
    return acc;
  }, {} as Record<string, CSLPresentation[]>);

  // Define section order
  const sectionOrder = ['Papers Presented', 'Panels Organized', 'Respondent'];
  const orderedSections = sectionOrder.filter((s) => grouped[s]);
  // Add any sections not in the predefined order
  for (const section of Object.keys(grouped)) {
    if (!orderedSections.includes(section)) {
      orderedSections.push(section);
    }
  }

  for (const section of orderedSections) {
    const presentations = grouped[section];
    content.push({ text: section, style: 'subsectionHeader' } as Content);

    for (const pres of presentations) {
      const formatted = formatCitation(pres);
      // Hanging indent: indent all lines, then pull first line back
      content.push({
        text: formatted,
        style: 'citation',
        margin: [18, 4, 0, 0],
        leadingIndent: -18,
      } as Content);
    }
  }

  return content;
}

/**
 * Build the Awards section
 */
function buildAwardsSection(): Content[] {
  const content: Content[] = [
    { text: 'Awards & Fellowships', style: 'sectionHeader', pageBreak: 'before' },
  ];

  // Sort by year descending
  const sorted = [...typedAwardsData].sort((a, b) => b.year - a.year);

  for (const award of sorted) {
    content.push({
      columns: [
        { text: award.award, style: 'itemTitle', width: '*' },
        { text: String(award.year), style: 'itemDate', width: 'auto', alignment: 'right' },
      ],
      margin: [0, 6, 0, 0],
    } as Content);
    content.push({ text: award.organization, style: 'itemSubtitle' } as Content);
  }

  return content;
}

/**
 * Generate the PDF document definition
 */
function generateDocumentDefinition(): TDocumentDefinitions {
  return {
    info: {
      title: 'Christopher Carroll Smith - Curriculum Vitae',
      author: 'Christopher Carroll Smith',
      subject: 'CV',
    },
    pageSize: 'LETTER',
    pageMargins: [60, 60, 60, 60],
    content: [
      // Header
      { text: 'Christopher Carroll Smith', style: 'name' },
      { text: 'Curriculum Vitae', style: 'title' },
      {
        text: [
          { text: 'ORCID: ', bold: true },
          { text: '0009-0008-1756-612X', link: 'https://orcid.org/0009-0008-1756-612X', color: '#0066cc' },
          { text: '  |  ' },
          { text: 'Website: ', bold: true },
          { text: 'christophercarrollsmith.com', link: 'https://christophercarrollsmith.com', color: '#0066cc' },
        ],
        style: 'links',
        margin: [0, 0, 0, 20],
      },

      // Sections
      ...buildEducationSection(),
      ...buildPublicationsSection(),
      ...buildPresentationsSection(),
      ...buildAwardsSection(),
    ],
    styles: {
      name: {
        fontSize: 24,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 4],
      },
      title: {
        fontSize: 14,
        alignment: 'center',
        margin: [0, 0, 0, 8],
        color: '#666666',
      },
      links: {
        fontSize: 10,
        alignment: 'center',
      },
      sectionHeader: {
        fontSize: 14,
        bold: true,
        margin: [0, 20, 0, 10],
        decoration: 'underline',
      },
      subsectionHeader: {
        fontSize: 12,
        bold: true,
        italics: true,
        margin: [0, 12, 0, 6],
        color: '#444444',
      },
      itemTitle: {
        fontSize: 11,
        bold: true,
      },
      itemSubtitle: {
        fontSize: 10,
        color: '#444444',
        margin: [0, 2, 0, 0],
      },
      itemNotes: {
        fontSize: 10,
        italics: true,
        color: '#666666',
        margin: [0, 2, 0, 0],
      },
      itemDate: {
        fontSize: 10,
        color: '#666666',
      },
      citation: {
        fontSize: 10,
        lineHeight: 1.3,
      },
    },
    defaultStyle: {
      font: 'Roboto',
    },
  };
}

/**
 * Main function to generate the PDF
 */
async function main() {
  console.log('Generating CV PDF...');

  const docDefinition = generateDocumentDefinition();
  const pdfDoc = printer.createPdfKitDocument(docDefinition);

  const outputPath = join(import.meta.dirname, '../public/cv.pdf');

  // Collect PDF chunks
  const chunks: Buffer[] = [];
  pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
  pdfDoc.on('end', () => {
    const pdfBuffer = Buffer.concat(chunks);
    writeFileSync(outputPath, pdfBuffer);
    console.log(`CV PDF generated: ${outputPath}`);
  });

  pdfDoc.end();
}

main().catch(console.error);
