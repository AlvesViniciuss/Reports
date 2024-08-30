function processFiles() {
    const embarqueFile = document.getElementById('embarque-file').files[0];
    const descargaFile = document.getElementById('descarga-file').files[0];
    const posicaoNavio = document.querySelector('input[name="posicao-navio"]:checked').value;

    if (!embarqueFile && !descargaFile) {
        alert('Por favor, faça upload de pelo menos um arquivo.');
        return;
    }

    const reader1 = new FileReader();
    const reader2 = new FileReader();
    let workbook1, workbook2;

    if (embarqueFile) {
        reader1.onload = function(e) {
            const data1 = new Uint8Array(e.target.result);
            workbook1 = XLSX.read(data1, {type: 'array'});

            if (descargaFile) {
                reader2.onload = function(e) {
                    const data2 = new Uint8Array(e.target.result);
                    workbook2 = XLSX.read(data2, {type: 'array'});

                    const data = extractData(workbook1, workbook2);
                    calculateDistribution(data, posicaoNavio);
                };
                reader2.readAsArrayBuffer(descargaFile);
            } else {
                const data = extractData(workbook1);
                calculateDistribution(data, posicaoNavio);
            }
        };
        reader1.readAsArrayBuffer(embarqueFile);
    } else if (descargaFile) {
        reader2.onload = function(e) {
            const data2 = new Uint8Array(e.target.result);
            workbook2 = XLSX.read(data2, {type: 'array'});

            const data = extractData(null, workbook2);
            calculateDistribution(data, posicaoNavio);
        };
        reader2.readAsArrayBuffer(descargaFile);
    }
}

function extractData(workbook1, workbook2) {
    let combinedData = [];
    if (workbook1) {
        const sheet1 = workbook1.Sheets[workbook1.SheetNames[0]];
        const data1 = XLSX.utils.sheet_to_json(sheet1, {header: 1});
        combinedData = combinedData.concat(data1);
    }
    if (workbook2) {
        const sheet2 = workbook2.Sheets[workbook2.SheetNames[0]];
        const data2 = XLSX.utils.sheet_to_json(sheet2, {header: 1});
        combinedData = combinedData.concat(data2);
    }

    console.log("Combined Data:", combinedData); // Debug log
    return combinedData;
}

function calculateDistribution(data, posicaoNavio) {
    let deckTerra = 0, deckMar = 0, poraoTerra = 0, poraoMar = 0;
    let totalCount = 0;

    data.forEach(row => {
        const posicao = row[0]; // Posição está na primeira coluna (coluna A)
        if (posicao && typeof posicao === 'string') {
            const relevantPart = posicao.slice(-4); // Últimos 4 caracteres
            const rowNum = parseInt(relevantPart.slice(0, 2), 10);
            const altura = parseInt(relevantPart.slice(2, 4), 10);

            console.log("Posição:", posicao, "Relevant Part:", relevantPart, "Row Num:", rowNum, "Altura:", altura); // Debug log

            let isTerra = false, isDeck = false;

            if (posicaoNavio === 'bombordo') {
                isTerra = rowNum % 2 === 0;
            } else {
                isTerra = rowNum % 2 !== 0;
            }

            isDeck = altura >= 60;
            if (altura < 20) {
                isDeck = false;
            }

            if (isDeck) {
                if (isTerra) {
                    deckTerra++;
                } else {
                    deckMar++;
                }
            } else {
                if (isTerra) {
                    poraoTerra++;
                } else {
                    poraoMar++;
                }
            }

            totalCount++;
        }
    });

    console.log("Deck Terra:", deckTerra, "Deck Mar:", deckMar, "Porão Terra:", poraoTerra, "Porão Mar:", poraoMar, "Total:", totalCount); // Debug log

    if (totalCount > 0) {
        const deckTerraPct = (deckTerra / totalCount * 100).toFixed(2);
        const deckMarPct = (deckMar / totalCount * 100).toFixed(2);
        const poraoTerraPct = (poraoTerra / totalCount * 100).toFixed(2);
        const poraoMarPct = (poraoMar / totalCount * 100).toFixed(2);

        document.getElementById('deck-terra').textContent = `${deckTerraPct}%`;
        document.getElementById('deck-mar').textContent = `${deckMarPct}%`;
        document.getElementById('porao-terra').textContent = `${poraoTerraPct}%`;
        document.getElementById('porao-mar').textContent = `${poraoMarPct}%`;
    } else {
        document.getElementById('deck-terra').textContent = `0%`;
        document.getElementById('deck-mar').textContent = `0%`;
        document.getElementById('porao-terra').textContent = `0%`;
        document.getElementById('porao-mar').textContent = `0%`;
    }
}
