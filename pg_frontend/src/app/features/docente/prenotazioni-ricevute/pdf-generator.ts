/**
 * Helper utility to handle PDF Generation for Teacher bookings and daily agenda.
 * Decouples massive HTML templates and window popup scripting from the main component.
 */

// Helper to format date string from YYYY-MM-DD to DD/MM/YYYY
function formattaData(dataStr: string): string {
  if (!dataStr) return '';
  const parts = dataStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dataStr;
}

// Helper to safely check states with casing tolerance
function checkStato(stato: string, atteso: string): boolean {
  if (!stato) return false;
  return stato.toLowerCase() === atteso.toLowerCase();
}

/**
 * Exports today's agenda as a PDF.
 * @param docente Current logged-in teacher info.
 * @param agenda Array of today's bookings.
 * @param localOggiStr The current local date string (YYYY-MM-DD).
 * @returns boolean indicating if the print window was successfully opened.
 */
export function exportAgendaPDF(docente: any, agenda: any[], localOggiStr: string): boolean {
  const dataOggiFormatted = formattaData(localOggiStr);
  const nomeDocente = docente ? `${docente.nome} ${docente.cognome}` : 'Docente';

  let rowsHtml = '';
  agenda.forEach((item, index) => {
    let statusBadge = '';
    if (checkStato(item.stato, 'confermata') || checkStato(item.stato, 'confermato')) {
      statusBadge = `<span style="background-color: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600;">Confermata</span>`;
    } else if (checkStato(item.stato, 'in_attesa') || checkStato(item.stato, 'in-attesa')) {
      statusBadge = `<span style="background-color: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600;">In attesa</span>`;
    } else if (checkStato(item.stato, 'completata')) {
      statusBadge = `<span style="background-color: #f3f4f6; color: #374151; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600;">Completata</span>`;
    } else {
      statusBadge = `<span style="background-color: #f3f4f6; color: #4b5563; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600;">${item.stato}</span>`;
    }

    rowsHtml += `
      <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
        <td style="font-weight: 700; color: #1e3a8a; width: 12%;">${item.oraInizio} - ${item.oraFine}</td>
        <td style="font-weight: 600; width: 22%;">${item.studente}</td>
        <td style="width: 28%;">${item.argomento}</td>
        <td style="color: #4b5563; width: 20%;">${item.luogoRicevimento?.aula || 'Studio Docente'}</td>
        <td style="width: 18%; text-align: center;">${statusBadge}</td>
      </tr>
    `;
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Agenda Ricevimenti - ${dataOggiFormatted}</title>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #1f2937;
          padding: 20px;
          background: #ffffff;
          margin: 0;
        }
        #print-container {
          padding: 20px;
        }
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .brand-title {
          font-size: 28px;
          font-weight: 800;
          color: #2563eb;
          margin: 0;
        }
        .brand-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 4px 0 0 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .document-title {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
          text-align: right;
        }
        .document-date {
          font-size: 14px;
          color: #4b5563;
          margin: 4px 0 0 0;
          text-align: right;
        }
        .info-section {
          background-color: #f3f4f6;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 30px;
          font-size: 15px;
        }
        .info-section p {
          margin: 6px 0;
        }
        .info-label {
          font-weight: bold;
          color: #4b5563;
          display: inline-block;
          width: 120px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
        }
        th {
          background-color: #2563eb;
          color: #ffffff;
          font-weight: 700;
          text-align: left;
          padding: 12px 16px;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        td {
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 13px;
          vertical-align: middle;
        }
        tr.even {
          background-color: #f9fafb;
        }
        .footer {
          margin-top: 30px;
          border-top: 1px solid #e5e7eb;
          padding-top: 15px;
          text-align: center;
          font-size: 11px;
          color: #9ca3af;
        }
        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div id="print-container">
        <div class="header-container">
          <div>
            <h1 class="brand-title">UniMeet</h1>
            <p class="brand-subtitle">Ricevimento e Prenotazioni</p>
          </div>
          <div>
            <h2 class="document-title">Agenda di Oggi</h2>
            <p class="document-date">${dataOggiFormatted}</p>
          </div>
        </div>

        <div class="info-section">
          <p><span class="info-label">Docente:</span> <strong>${nomeDocente}</strong></p>
          <p><span class="info-label">Data Agenda:</span> ${dataOggiFormatted}</p>
          <p><span class="info-label">Ricevimenti:</span> ${agenda.length} pianificati</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Orario</th>
              <th>Studente</th>
              <th>Argomento</th>
              <th>Luogo</th>
              <th style="text-align: center;">Stato</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          Generato automaticamente da UniMeet il ${new Date().toLocaleString('it-IT')} &copy; ${new Date().getFullYear()}
        </div>
      </div>

      <script>
        window.onload = function() {
          const element = document.getElementById('print-container');
          const opt = {
            margin:       [15, 15, 20, 15],
            filename:     'agenda_ricevimenti_${localOggiStr}.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };

          function runExport() {
            if (typeof html2pdf !== 'undefined') {
              html2pdf().set(opt).from(element).save().then(function() {
                setTimeout(function() {
                  window.close();
                }, 800);
              }).catch(function(err) {
                console.error('PDF generation error', err);
                fallbackPrint();
              });
            } else {
              console.warn('html2pdf library not loaded yet, retrying...');
              setTimeout(runExport, 100);
            }
          }

          function fallbackPrint() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          }

          runExport();
        }
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    return true;
  }
  return false;
}

/**
 * Exports currently filtered bookings as a PDF report list.
 * @param docente Current logged-in teacher info.
 * @param lista The array of currently filtered bookings.
 * @param localOggiStr The current local date string (YYYY-MM-DD).
 * @param searchTerm The active text search query.
 * @param filtroStato The active status filter.
 * @param filtroTempo The active temporal filter.
 * @returns boolean indicating if the print window was successfully opened.
 */
export function exportListaPDF(
  docente: any,
  lista: any[],
  localOggiStr: string,
  searchTerm: string,
  filtroStato: string,
  filtroTempo: string
): boolean {
  const dataGenerazione = new Date().toLocaleString('it-IT');
  const nomeDocente = docente ? `${docente.nome} ${docente.cognome}` : 'Docente';

  // Build filter description string
  let descFiltri = '';
  if (searchTerm.trim()) descFiltri += `Ricerca: "${searchTerm}" | `;
  descFiltri += `Stato: ${filtroStato === 'tutti' ? 'Tutti' : filtroStato.replace('-', ' ')} | `;
  descFiltri += `Periodo: ${filtroTempo}`;

  let rowsHtml = '';
  lista.forEach((item, index) => {
    let statusBadge = '';
    if (checkStato(item.stato, 'confermata') || checkStato(item.stato, 'confermato')) {
      statusBadge = `<span style="background-color: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600;">Confermata</span>`;
    } else if (checkStato(item.stato, 'in_attesa') || checkStato(item.stato, 'in-attesa')) {
      statusBadge = `<span style="background-color: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600;">In attesa</span>`;
    } else if (checkStato(item.stato, 'completata')) {
      statusBadge = `<span style="background-color: #f3f4f6; color: #374151; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600;">Completata</span>`;
    } else if (checkStato(item.stato, 'annullata') || checkStato(item.stato, 'annullato')) {
      statusBadge = `<span style="background-color: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600;">Annullata</span>`;
    } else {
      statusBadge = `<span style="background-color: #f3f4f6; color: #4b5563; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600;">${item.stato}</span>`;
    }

    rowsHtml += `
      <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
        <td style="font-weight: 600; width: 15%;">${formattaData(item.data)}</td>
        <td style="font-weight: 700; color: #1e3a8a; width: 12%;">${item.oraInizio} - ${item.oraFine}</td>
        <td style="font-weight: 600; width: 22%;">${item.studente}</td>
        <td style="width: 25%;">${item.argomento}</td>
        <td style="color: #4b5563; width: 16%;">${item.luogoRicevimento?.aula || 'Studio Docente'}</td>
        <td style="width: 10%; text-align: center;">${statusBadge}</td>
      </tr>
    `;
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Report Ricevimenti - ${nomeDocente}</title>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #1f2937;
          padding: 20px;
          background: #ffffff;
          margin: 0;
        }
        #print-container {
          padding: 20px;
        }
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .brand-title {
          font-size: 28px;
          font-weight: 800;
          color: #2563eb;
          margin: 0;
        }
        .brand-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 4px 0 0 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .document-title {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
          text-align: right;
        }
        .document-date {
          font-size: 14px;
          color: #4b5563;
          margin: 4px 0 0 0;
          text-align: right;
        }
        .info-section {
          background-color: #f3f4f6;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 30px;
          font-size: 15px;
        }
        .info-section p {
          margin: 6px 0;
        }
        .info-label {
          font-weight: bold;
          color: #4b5563;
          display: inline-block;
          width: 120px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
        }
        th {
          background-color: #2563eb;
          color: #ffffff;
          font-weight: 700;
          text-align: left;
          padding: 12px 16px;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        td {
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 13px;
          vertical-align: middle;
        }
        tr.even {
          background-color: #f9fafb;
        }
        .footer {
          margin-top: 30px;
          border-top: 1px solid #e5e7eb;
          padding-top: 15px;
          text-align: center;
          font-size: 11px;
          color: #9ca3af;
        }
        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div id="print-container">
        <div class="header-container">
          <div>
            <h1 class="brand-title">UniMeet</h1>
            <p class="brand-subtitle">Ricevimento e Prenotazioni</p>
          </div>
          <div>
            <h2 class="document-title">Report Ricevimenti</h2>
            <p class="document-date">${dataGenerazione}</p>
          </div>
        </div>

        <div class="info-section">
          <p><span class="info-label">Docente:</span> <strong>${nomeDocente}</strong></p>
          <p><span class="info-label">Filtri applicati:</span> ${descFiltri}</p>
          <p><span class="info-label">Ricevimenti trovati:</span> ${lista.length} elementi</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Orario</th>
              <th>Studente</th>
              <th>Argomento</th>
              <th>Luogo</th>
              <th style="text-align: center;">Stato</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          Report generato da UniMeet il ${dataGenerazione} &copy; ${new Date().getFullYear()}
        </div>
      </div>

      <script>
        window.onload = function() {
          const element = document.getElementById('print-container');
          const opt = {
            margin:       [15, 15, 20, 15],
            filename:     'report_ricevimenti_${localOggiStr}.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };

          function runExport() {
            if (typeof html2pdf !== 'undefined') {
              html2pdf().set(opt).from(element).save().then(function() {
                setTimeout(function() {
                  window.close();
                }, 800);
              }).catch(function(err) {
                console.error('PDF generation error', err);
                fallbackPrint();
              });
            } else {
              console.warn('html2pdf library not loaded yet, retrying...');
              setTimeout(runExport, 100);
            }
          }

          function fallbackPrint() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          }

          runExport();
        }
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    return true;
  }
  return false;
}
