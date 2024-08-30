window.generatePDF = function() {
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    // Título do PDF
    doc.setFontSize(18);
    doc.text('Relatório de Movimentação de Navio', 14, 22);

    // Função para adicionar tabela ao PDF
    function addTableToPDF(sectionTitle, tableId, startY) {
        doc.setFontSize(14);
        doc.text(sectionTitle, 14, startY);

        const table = document.getElementById(tableId);
        const rows = Array.from(table.rows);
        const head = rows[0].cells;
        const body = rows.slice(1).map(row => Array.from(row.cells).map(cell => cell.innerText));

        if (head.length > 0) {
            doc.autoTable({
                head: [Array.from(head).map(cell => cell.innerText)],
                body: body,
                startY: startY + 10,
                theme: 'grid'
            });
        }
    }

    // Adicionando tabelas ao PDF
    addTableToPDF('Produção Total', 'totalResultTable', 30);
    addTableToPDF('Produção por Operador', 'operatorResultTable', doc.previousAutoTable.finalY + 20);
    addTableToPDF('Produção por Turno', 'shiftResultTable', doc.previousAutoTable.finalY + 20);

    // Salvar o PDF
    doc.save('relatorio_contabilidade_diaria.pdf');
}
