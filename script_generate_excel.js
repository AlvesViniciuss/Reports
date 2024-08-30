window.generateExcel = function() {
    // Função para adicionar tabela ao Excel
    function addTableToExcel(sheet, sectionTitle, tableId) {
        const table = document.getElementById(tableId);
        const rows = Array.from(table.rows);
        const head = Array.from(rows[0].cells).map(cell => cell.innerText);
        const body = rows.slice(1).map(row => Array.from(row.cells).map(cell => cell.innerText));
        
        let rowIndex = sheet.length;
        
        // Adiciona o título da seção
        sheet.push([sectionTitle]);
        rowIndex++;
        
        // Adiciona o cabeçalho da tabela
        sheet.push(head);
        rowIndex++;
        
        // Adiciona o corpo da tabela
        body.forEach(row => {
            sheet.push(row);
            rowIndex++;
        });
        
        // Linha em branco entre tabelas
        sheet.push([]);
    }
    
    const workbook = XLSX.utils.book_new();
    const sheet = [];
    
    // Adicionando tabelas ao Excel
    addTableToExcel(sheet, 'Produção Total', 'totalResultTable');
    addTableToExcel(sheet, 'Produção por Operador', 'operatorResultTable');
    addTableToExcel(sheet, 'Produção por Turno', 'shiftResultTable');
    
    // Converte a folha em uma planilha
    const worksheet = XLSX.utils.aoa_to_sheet(sheet);
    
    // Adiciona a planilha ao workbook com um nome válido
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatorio_Patio');
    
    // Salvar o arquivo Excel
    XLSX.writeFile(workbook, 'relatorio_contabilidade_diaria.xlsx');
}
