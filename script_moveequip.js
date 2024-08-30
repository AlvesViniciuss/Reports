document.getElementById('fileInput').addEventListener('change', handleFileSelect);

let csvData = [];

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const contents = e.target.result;
            csvData = parseCSV(contents);
        };
        reader.readAsText(file);
    }
}

function parseCSV(contents) {
    const lines = contents.split('\n').filter(line => line.trim() !== '');
    const result = [];
    const headers = lines[0].split(',').map(header => header.trim());

    for (let i = 1; i < lines.length; i++) {
        const currentline = lines[i].split(',');
        if (currentline.length === headers.length) {
            const obj = {};
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentline[j].trim();
            }
            result.push(obj);
        }
    }
    return result;
}

function processCSV() {
    const dateFilter = document.getElementById('dateFilter').value;
    const results = calculateProduction(csvData, dateFilter);
    displayResults(results);
    displayUtilizationChart(results.total);
}

function calculateProduction(data, dateFilter) {
    const productionCount = {
        total: {},
        operator: {},
        shift: {}
    };

    data.forEach(item => {
        const equipment = item['Che Name'];
        const moveType = item['Move kind'];
        const operator = item['Operator'];
        const timestamp = item['Timestamp'];

        const [dateStr, timeStr] = timestamp.split(' ');
        const [day, month, year] = dateStr.split('/');
        const [hour, minute, second] = timeStr.split(':');

        const eventDate = new Date(year, month - 1, day, hour, minute, second);

        if (dateFilter) {
            const filterDate = new Date(dateFilter);
            if (
                eventDate.getFullYear() !== filterDate.getFullYear() ||
                eventDate.getMonth() !== filterDate.getMonth() ||
                eventDate.getDate() !== filterDate.getDate()
            ) {
                return;
            }
        }

        if (!productionCount.total[equipment]) {
            productionCount.total[equipment] = {};
        }

        if (!productionCount.operator[operator]) {
            productionCount.operator[operator] = {};
        }

        const shift = getShift(eventDate);
        if (!productionCount.shift[shift]) {
            productionCount.shift[shift] = {};
        }

        productionCount.total[equipment][moveType] = (productionCount.total[equipment][moveType] || 0) + 1;
        productionCount.operator[operator][moveType] = (productionCount.operator[operator][moveType] || 0) + 1;
        productionCount.shift[shift][moveType] = (productionCount.shift[shift][moveType] || 0) + 1;
    });

    return productionCount;
}

function displayResults(results) {
    displayTable(results.total, 'totalResultTable', true, 'equipment');
    displayTable(results.operator, 'operatorResultTable', true, 'operator');
    displayTable(results.shift, 'shiftResultTable', true, 'shift');
}

function displayTable(data, tableId, showTotalColumn, sortBy) {
    const tableHead = document.querySelector(`#${tableId} thead`);
    const tableBody = document.querySelector(`#${tableId} tbody`);
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    const columnsOrder = ['YARD', 'RECV', 'DLVR', 'RLOD', 'RDSC', 'LOAD', 'DSCH', 'OTHR', 'TOTAL'];

    const headRow = document.createElement('tr');
    headRow.innerHTML = `<th>${sortBy === 'equipment' ? 'Equipamento' : sortBy === 'operator' ? 'Operador' : 'Turno'}</th>`;
    columnsOrder.forEach(column => {
        headRow.innerHTML += `<th>${column}</th>`;
    });
    tableHead.appendChild(headRow);

    const sortedKeys = Object.keys(data).sort((a, b) => {
        if (sortBy === 'equipment') {
            return a.localeCompare(b); 
        } else {
            return getTotalCount(data[b]) - getTotalCount(data[a]);
        }
    });

    sortedKeys.forEach(key => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${key}</td>`;
        let totalKey = 0; 
        columnsOrder.forEach(column => {
            const total = data[key][column] || 0;
            row.innerHTML += `<td>${total}</td>`;
            if (column !== 'TOTAL') {
                totalKey += total;
            }
        });
        if (showTotalColumn) {
            row.querySelector(`td:last-child`).innerHTML = totalKey;
        }
        tableBody.appendChild(row);
    });
}

function displayUtilizationChart(totalData) {
    const canvas = document.getElementById('utilizationChart');
    const ctx = canvas.getContext('2d');

    let totalMovements = 0;
    for (const equipment in totalData) {
        for (const moveType in totalData[equipment]) {
            if (moveType !== 'Total') {
                totalMovements += totalData[equipment][moveType];
            }
        }
    }

    const utilizationData = [];
    const equipmentLabels = Object.keys(totalData).sort();

    equipmentLabels.forEach(equipment => {
        let equipmentTotal = 0;
        for (const moveType in totalData[equipment]) {
            if (moveType !== 'Total') {
                equipmentTotal += totalData[equipment][moveType];
            }
        }
        const utilizationRate = totalMovements === 0 ? 0 : (equipmentTotal / totalMovements) * 100;
        utilizationData.push({
            equipment: equipment,
            utilizationRate: utilizationRate.toFixed(2)
        });
    });

    utilizationData.sort((a, b) => {
        return a.equipment.localeCompare(b.equipment);
    });

    const labels = utilizationData.map(item => item.equipment);
    const data = utilizationData.map(item => item.utilizationRate);

    const chartConfig = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Taxa de Utilização (%)',
                data: data,
                backgroundColor: '#007bff',
                borderColor: '#007bff',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: function(value) { return value + '%' }
                    }
                }]
            },
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Taxa de Utilização dos Equipamentos'
            }
        }
    };

    new Chart(ctx, chartConfig);
}

function getShift(date) {
    const hour = date.getHours();
    if (hour >= 0 && hour < 8) {
        return 'Turno A';
    } else if (hour >= 8 && hour < 16) {
        return 'Turno B';
    } else {
        return 'Turno C';
    }
}

function getTotalCount(data) {
    let totalCount = 0;
    for (const moveType in data) {
        if (moveType !== 'TOTAL') {
            totalCount += data[moveType];
        }
    }
    return totalCount;
}

function isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}
