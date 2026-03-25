const PDF_PAGE_WIDTH = 612;
const PDF_PAGE_HEIGHT = 792;
const LEFT_MARGIN = 48;
const TOP_MARGIN = 52;
const BOTTOM_MARGIN = 48;

const toPdfSafeText = (value) =>
    String(value || "")
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, "-")
        .replace(/[\u2022]/g, "-")
        .replace(/[^\x20-\x7E\n]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const escapePdfText = (value) =>
    String(value || "")
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)");

const sanitizeFileName = (value, fallback = "report") => {
    const cleaned = String(value || fallback)
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9._-]/g, "");
    return cleaned || fallback;
};

const wrapText = (text, fontSize, maxWidth) => {
    const normalized = toPdfSafeText(text);
    if (!normalized) return [];

    const approxCharWidth = fontSize * 0.52;
    const maxChars = Math.max(18, Math.floor(maxWidth / approxCharWidth));
    const words = normalized.split(" ");
    const lines = [];
    let current = "";

    words.forEach((word) => {
        const candidate = current ? `${current} ${word}` : word;
        if (candidate.length <= maxChars) {
            current = candidate;
            return;
        }
        if (current) lines.push(current);
        if (word.length <= maxChars) {
            current = word;
            return;
        }
        let sliceStart = 0;
        while (sliceStart < word.length) {
            const slice = word.slice(sliceStart, sliceStart + maxChars);
            lines.push(slice);
            sliceStart += maxChars;
        }
        current = "";
    });

    if (current) lines.push(current);
    return lines;
};

const buildPages = ({ title, subtitle, sections }) => {
    const pages = [];
    let entries = [];
    let y = PDF_PAGE_HEIGHT - TOP_MARGIN;

    const ensureSpace = (requiredHeight = 18) => {
        if (y - requiredHeight < BOTTOM_MARGIN) {
            pages.push(entries);
            entries = [];
            y = PDF_PAGE_HEIGHT - TOP_MARGIN;
        }
    };

    const pushLines = (lines, { font = "F1", fontSize = 12, indent = 0, gapAfter = 4 } = {}) => {
        const safeLines = Array.isArray(lines) ? lines.filter(Boolean) : [];
        safeLines.forEach((line) => {
            ensureSpace(fontSize * 1.5);
            entries.push({
                font,
                fontSize,
                x: LEFT_MARGIN + indent,
                y,
                text: line,
            });
            y -= fontSize * 1.35;
        });
        y -= gapAfter;
    };

    pushLines(wrapText(title, 22, PDF_PAGE_WIDTH - LEFT_MARGIN * 2), {
        font: "F2",
        fontSize: 22,
        gapAfter: 8,
    });

    if (subtitle) {
        pushLines(wrapText(subtitle, 11, PDF_PAGE_WIDTH - LEFT_MARGIN * 2), {
            font: "F1",
            fontSize: 11,
            gapAfter: 14,
        });
    }

    sections.forEach((section) => {
        pushLines(wrapText(section.heading, 15, PDF_PAGE_WIDTH - LEFT_MARGIN * 2), {
            font: "F2",
            fontSize: 15,
            gapAfter: 6,
        });

        const sectionLines = Array.isArray(section.lines) ? section.lines : [];
        if (!sectionLines.length) {
            pushLines(["-"], { fontSize: 12, gapAfter: 8 });
            return;
        }

        sectionLines.forEach((line) => {
            const raw = String(line || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
            const normalizedLines = raw.length ? raw : [String(line || "")];
            normalizedLines.forEach((text) => {
                const isBullet = /^[-*]\s+/.test(text);
                const cleaned = isBullet ? text.replace(/^[-*]\s+/, "") : text;
                const wrapped = wrapText(cleaned, 12, PDF_PAGE_WIDTH - LEFT_MARGIN * 2 - (isBullet ? 14 : 0));
                const lines = isBullet && wrapped.length ? [`- ${wrapped[0]}`, ...wrapped.slice(1)] : wrapped;
                pushLines(lines, {
                    font: "F1",
                    fontSize: 12,
                    indent: isBullet ? 10 : 0,
                    gapAfter: 2,
                });
            });
        });

        y -= 8;
    });

    if (entries.length) pages.push(entries);
    return pages;
};

const buildPdfString = (pages) => {
    const objects = [];
    const pageRefs = [];

    objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
    objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
    objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

    let nextId = 5;
    pages.forEach((pageEntries) => {
        const contentCommands = pageEntries
            .map((entry) => `BT /${entry.font} ${entry.fontSize} Tf ${entry.x.toFixed(2)} ${entry.y.toFixed(2)} Td (${escapePdfText(entry.text)}) Tj ET`)
            .join("\n");
        const contentId = nextId;
        const pageId = nextId + 1;
        nextId += 2;

        objects[contentId] = `<< /Length ${contentCommands.length} >>\nstream\n${contentCommands}\nendstream`;
        objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`;
        pageRefs.push(`${pageId} 0 R`);
    });

    objects[2] = `<< /Type /Pages /Count ${pageRefs.length} /Kids [${pageRefs.join(" ")}] >>`;

    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    for (let id = 1; id < objects.length; id += 1) {
        const body = objects[id];
        if (!body) continue;
        offsets[id] = pdf.length;
        pdf += `${id} 0 obj\n${body}\nendobj\n`;
    }

    const xrefStart = pdf.length;
    pdf += `xref\n0 ${objects.length}\n`;
    pdf += "0000000000 65535 f \n";
    for (let id = 1; id < objects.length; id += 1) {
        const offset = offsets[id] || 0;
        pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
    return pdf;
};

export const downloadSimplePdf = ({ fileName, title, subtitle = "", sections = [] }) => {
    const pages = buildPages({
        title: toPdfSafeText(title),
        subtitle: toPdfSafeText(subtitle),
        sections: Array.isArray(sections) ? sections : [],
    });
    const pdfString = buildPdfString(pages);
    const blob = new Blob([pdfString], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${sanitizeFileName(fileName, "report")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
