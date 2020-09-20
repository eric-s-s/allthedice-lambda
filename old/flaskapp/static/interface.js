$(onPageLoad);

function onPageLoad() {
    const allTableForms = $('.tableRequest');
    const allStatsForms = $('.statsRequest');
    const tableRequestArea = $('#tableRequestArea');
    const statRequestArea = $('#statsRequestArea');

    allTableForms.submit(function (event) {
        event.preventDefault();
        getTable(this);
    });
    allTableForms.data('tableObj', null);
    allTableForms.each(function () {
        clearRollResults($(this));
    });

    allStatsForms.submit(function (event) {
        event.preventDefault();
        const tableEntries = plotStats(this);
        showStatsRow(this, tableEntries);
    });

    setUpHiddenForms(statRequestArea, allStatsForms);
    setUpHiddenForms(tableRequestArea, allTableForms);

    showHiddenForm(tableRequestArea);
    // getTable(document.getElementById(idStr));

    showHiddenForm(statRequestArea);

    $('#more').click(function () {
        showHiddenForm(tableRequestArea);
    });
    $('#moreStats').click(function () {
        showHiddenForm(statRequestArea);
    });

    $('.rmStats').click(function () {
        hideStatsForm(this.parentNode.id);
    });

    $('.rmTable').click(function () {
        hideTableForm(this.parentNode.id);
    });
    $('.exampleClickable').click(function () {
        const exampleText = $(this).find('b').text();
        const form = setUpExample(exampleText);
        getTable(form);
    })

}


function setUpHiddenForms(containerJQuery, classJQuery) {
    const hiddenForms = [];
    classJQuery.each(function () {
        $(this).hide();
        hiddenForms.push(this.id);
    });
    hiddenForms.sort();
    containerJQuery.data('hiddenForms', hiddenForms);
}


function setUpExample(exampleStr) {
    const requestArea = $('#tableRequestArea');
    let nextFormIdStr = showHiddenForm(requestArea);
    if (nextFormIdStr === null) {
        nextFormIdStr = $('.tableRequest')[0].id;
    }
    const toAlter = document.getElementById(nextFormIdStr);
    toAlter.tableQuery.value = exampleStr;
    return toAlter;
}

function processNewData(tableRequestJQuery, data) {
    console.log(data);
    tableRequestJQuery.data('tableObj', data);
    plotCurrentTables();
    resetStatsTable();
    clearRollResults(tableRequestJQuery);
    assignRollers();
}

function getTable(tableForm) {
    const requestStr = tableForm.tableQuery.value;
    $.getJSON($SCRIPT_ROOT + '_get_table', {'requestStr': requestStr},
        function (data) {
            processNewData($(tableForm), data);
        }
    ).fail(function (jqXHR) {
            console.log(jqXHR);
            /** @namespace jqXHR.responseJSON */
            const errorJson = jqXHR.responseJSON;
            alert(
                jqXHR.status + ': ' + jqXHR.statusText + '\n' +
                'error type: ' + errorJson.type + '\ndetails: ' + errorJson.error
            );
        }
    );
}

function hideTableForm(idStr) {
    const theForm = $('#' + idStr);
    theForm.hide();
    theForm.data('tableObj', null);
    theForm[0].reset();
    const hiddenForms = $('#tableRequestArea').data('hiddenForms');
    hiddenForms.push(idStr);
    hiddenForms.sort();
    plotCurrentTables();
    resetStatsTable();
    clearRollResults(theForm);
    assignRollers();
}

function hideStatsForm(idStr) {
    const theForm = $('#' + idStr);
    theForm.hide();
    theForm[0].reset();
    const hiddenForms = $('#statsRequestArea').data('hiddenForms');
    hiddenForms.push(idStr);
    hiddenForms.sort();
    removeStatsTraces(idStr);
    $('#rowFor-' + idStr).hide();
}

function showHiddenForm(requestAreaJQuery) {
    const hiddenTables = requestAreaJQuery.data('hiddenForms');
    if (hiddenTables.length > 0) {
        const idStr = hiddenTables.shift();
        $('#' + idStr).show();
        return idStr;
    }
    return null;
}

function plotCurrentTables() {
    const markersCutOff = 100;

    const plotData = [];
    $('.tableRequest').each(function () {
        const tableObj = $('#' + this.id).data('tableObj');
        if (tableObj !== null) {
            const mode = (tableObj.data.x.length <= markersCutOff) ? "lines+markers" : "lines";
            const datum = {
                x: tableObj.data.x,
                y: tableObj.data.y,
                name: getDiceListString(tableObj.name),
                mode: mode
            };
            plotData.push(datum);
        }
    });
    const layout = {
        margin: {t: 25},
        showlegend: true,
        legend: {x: 1, y: 0.5},
        xaxis: {title: 'rolls'},
        yaxis: {title: 'pct chance'}  // type: 'log'
    };
    const graphDiv = document.getElementById('plotter');
    Plotly.newPlot(graphDiv, plotData, layout);
    getRangesForStats();
}

function getRangesForStats() {
    const data = document.getElementById('plotter').data;
    let min = Infinity;
    let max = -Infinity;
    data.forEach(function (el) {
        const xVals = el.x;
        const elMin = Math.min.apply(null, xVals);
        const elMax = Math.max.apply(null, xVals);
        min = Math.min(min, elMin);
        max = Math.max(max, elMax);
    });
    if (min === Infinity || max === -Infinity) {
        min = 0;
        max = 0;
    }
    $('.statsInput').attr({'min': min, 'value': min, 'max': max});
}

// resetStatsTable
function resetStatsTable() {
    emptyStatsTable();

    let colorIndex = 0;

    const tableName = $('#tableName');
    const tableRange = $('#tableRange');
    const tableMean = $('#tableMean');
    const tableStdDev = $('#tableStdDev');

    $('.tableRequest').each(function () {
        const tableObj = $(this).data('tableObj');
        if (tableObj !== null) {
            const forStatsTable = getTableObjStats(tableObj, colorIndex);
            colorIndex++;
            tableName.append(forStatsTable['tableName']);
            tableRange.append(forStatsTable['tableRange']);
            tableMean.append(forStatsTable['tableMean']);
            tableStdDev.append(forStatsTable['tableStdDev']);
        }
    });
}

function emptyStatsTable() {
    const statsTable = $('#statsTable');
    statsTable.find('tr:not(".keeper")').hide();
    statsTable.find('td').remove();
}

function getTableObjStats(tableObj, index) {
    const out = {};

    const colors = [
        '#1f77b4',  // muted blue  rgba(31,119,180, 1)
        '#ff7f0e',  // safety orange  rgba(255,127,14, 1)
        '#2ca02c',  // cooked asparagus green  rgba(44,160,44, 1)
        '#d62728',  // brick red  rgba(214,39,40, 1)
        '#9467bd',  // muted purple  rgba(148,103,189, 1)
        '#8c564b',  // chestnut brown  rgba(140,86,75, 1)
        '#e377c2',  // raspberry yogurt pink  rgba(227,119,194, 1)
        '#7f7f7f',  // middle gray  rgba(127,127,127, 1)
        '#bcbd22',  // curry yellow-green  rgba(188,189,34, 1)
        '#17becf'  // blue-teal  rgba(23,190,207, 1)
    ];
    const color = colors[index % colors.length];
    const name = getDiceListString(tableObj.name);
    const tooltipText = "<span class='tooltiptext'>" + tableObj.diceStr.replace(/\n/g, '</br>') + "</span>";

    out['tableName'] = "<td class='tooltip' style='color:" + color + "'>" + name + tooltipText + "</td>";
    out['tableRange'] = "<td style='color:" + color + "'>" + tableObj.range[0] + ' to ' + tableObj.range[1] + '</td>';
    out['tableMean'] = "<td style='color:" + color + "'>" + tableObj.mean + '</td>';
    out['tableStdDev'] = "<td style='color:" + color + "'>" + tableObj.stddev + '</td>';
    return out;
}

// assignRollers
function assignRollers() {
    $('.tableRequest').each(function () {
            assignRoller($(this));
        }
    )
}

function assignRoller(tableRequestJQuery) {
    const tableObj = tableRequestJQuery.data("tableObj");
    const rollerButton = tableRequestJQuery.find('.roller');

    rollerButton.off("click");

    if (tableObj !== null) {
        const rollerObject = new Roller(tableObj.roller.height, tableObj.roller.aliases);
        const rollResults = tableRequestJQuery.data("rollResults");
        rollerButton.click(function () {
                const newRoll = rollerObject.roll();
                rollResults.push(newRoll);
                displayRollResults(tableRequestJQuery);
            }
        );
    }
}

function displayRollResults(tableRequestJQuery) {
    const rollResultsCopy = tableRequestJQuery.data('rollResults').slice();
    let innerHTML = "None";
    const firstNumber = rollResultsCopy.pop();
    if (firstNumber !== undefined) {
        innerHTML = firstNumber;
    }
    const addTollTipText = (rollResultsCopy.length > 0);
    const toolTipStart = "<span class=\"tooltiptext numberList\">Previous<br>";
    const toolTipEnd = "</span>";
    if (addTollTipText) {
        innerHTML += toolTipStart;
    }
    while (rollResultsCopy.length > 0) {
        innerHTML += rollResultsCopy.pop() + "<br>";
    }
    if (addTollTipText) {
        innerHTML += toolTipEnd;
    }
    tableRequestJQuery.find('.rollDisplay')[0].innerHTML = innerHTML;
}

function clearRollResults(tableRequestJQuery) {
    tableRequestJQuery.data('rollResults', []);
    displayRollResults(tableRequestJQuery);
}

// plotStats and helpers
function plotStats(statsForm) {
    removeStatsTraces(statsForm.id);
    const graphDiv = document.getElementById('plotter');

    const queryArr = getRange(statsForm.left.value, statsForm.right.value);

    const statsData = [];
    const tableEntries = [];
    let nonNullDataIndex = 0;

    $('.tableRequest').each(function () {
        const tableObj = $('#' + this.id).data('tableObj');
        if (tableObj !== null) {
            const statsInfo = getStats(tableObj.forSciNum, queryArr);
            statsInfo['header'] = getDiceListString(tableObj.name);

            const traceDatum = statsGraphVals(queryArr, tableObj);
            traceDatum['name'] = statsGraphName(tableObj, statsInfo.pctChance, queryArr);

            traceDatum['fillcolor'] = statsGraphColor(nonNullDataIndex, statsForm.id);
            traceDatum['statsGroup'] = statsForm.id;
            traceDatum['legendgroup'] = tableObj.diceStr;
            nonNullDataIndex++;

            statsData.push(traceDatum);
            tableEntries.push(statsInfo);

        }
    });
    Plotly.addTraces(graphDiv, statsData);
    return tableEntries;
}

function removeStatsTraces(statsFormId) {
    const graphDiv = document.getElementById('plotter');
    const toRemove = [];
    for (let i = 0; i < graphDiv.data.length; i++) {
        if (graphDiv.data[i].statsGroup === statsFormId) {
            toRemove.push(i);
        }
    }
    Plotly.deleteTraces(graphDiv, toRemove);
}

function getRange(left, right) {
    const leftInt = parseInt(left);
    const rightInt = parseInt(right);
    const out = [];
    let stop, start;
    if (leftInt < rightInt) {
        start = leftInt;
        stop = rightInt;
    } else {
        start = rightInt;
        stop = leftInt;
    }
    for (let i = start; i <= stop; i++) {
        out.push(i);
    }
    return out;
}

function statsGraphVals(queryArr, tableObj) {
    const start = Math.max(queryArr[0], tableObj.range[0]);
    const stop = Math.min(queryArr[queryArr.length - 1], tableObj.range[1]);
    const startIndex = tableObj.data.x.indexOf(start);
    const stopIndex = tableObj.data.x.indexOf(stop);
    if (startIndex === -1 || stopIndex === -1) {
        return {x: [], y: [], type: 'scatter', mode: 'none', fill: 'tozeroy', hoverinfo: 'skip'};
    }
    const xVals = tableObj.data.x.slice(startIndex, stopIndex + 1);
    const yVals = tableObj.data.y.slice(startIndex, stopIndex + 1);
    if (start > tableObj.range[0]) {
        const beforeVal = 0.48 * tableObj.data.y[startIndex - 1] + 0.52 * tableObj.data.y[startIndex];
        xVals.unshift(start - 0.48);
        yVals.unshift(beforeVal);
    }
    if (stop < tableObj.range[1]) {
        const afterVal = 0.48 * tableObj.data.y[stopIndex + 1] + 0.52 * tableObj.data.y[stopIndex];
        xVals.push(stop + 0.48);
        yVals.push(afterVal);
    }
    return {x: xVals, y: yVals, type: 'scatter', mode: 'none', fill: 'tozeroy', hoverinfo: 'skip'};
}

function statsGraphName(tableObj, pctString, queryArr) {
    const tableName = getDiceListString(tableObj.name);
    const query = (queryArr.length === 1) ? queryArr[0] : queryArr[0] + 'to' + queryArr[queryArr.length - 1];
    return tableName + ': [' + query + ']: ' + pctString + '%';
}

function statsGraphColor(matchGraphIndex, statsFormId) {
    const colorObjs = [
        {'r': 31, 'g': 119, 'b': 180, 'a': 0.5},
        {'r': 255, 'g': 127, 'b': 14, 'a': 0.5},
        {'r': 44, 'g': 160, 'b': 44, 'a': 0.5},
        {'r': 214, 'g': 39, 'b': 40, 'a': 0.5},
        {'r': 148, 'g': 103, 'b': 189, 'a': 0.5},
        {'r': 140, 'g': 86, 'b': 75, 'a': 0.5},
        {'r': 227, 'g': 119, 'b': 194, 'a': 0.5},
        {'r': 127, 'g': 127, 'b': 127, 'a': 0.5},
        {'r': 188, 'g': 189, 'b': 34, 'a': 0.5},
        {'r': 23, 'g': 190, 'b': 207, 'a': 0.5}
    ];
    const rgbaObj = colorObjs[matchGraphIndex];
    const modValues = [
        [0, -10, 10], [10, 10, 10], [-10, -10, -10], [-10, 10, -10], [10, -10, 10],
        [-10, -10, 10], [10, -10, -10], [-10, 10, 10], [10, 10, -10], [10, 0, -10]
    ];
    const mod = modValues[statsFormId.slice(-1)];

    return 'rgba(' + (rgbaObj.r + mod[0]) + ',' + (rgbaObj.g + mod[1]) + ',' + (rgbaObj.b + mod[2]) + ',0.5)';
}

// showStatsRow
function showStatsRow(statsForm, tableEntries) {
    const rowForStats = $('#rowFor-' + statsForm.id);
    rowForStats[0].innerHTML = getTableRow(statsForm, tableEntries);
    rowForStats.show();
}

function getTableRow(statsForm, tableEntries) {
    const left = statsForm.left.value;
    const right = statsForm.right.value;
    const title = (parseInt(left) < parseInt(right)) ? left + ' to ' + right : right + ' to ' + left;
    let tableRow = "<th>" + title + "</th>";
    for (let i = 0; i < tableEntries.length; i++) {
        const entry = tableEntries[i];
        tableRow += "<td class='tooltip'>" + entry.pctChance + ' %' + getToolTipText(entry) + '</td>';
    }
    return tableRow;
}

function getToolTipText(statsObj) {
    const start = "<span class='tooltiptext'>";
    const end = '</span>';
    return (
        start + 'occurrences: ' + statsObj.occurrences +
        '</br>out of total: ' + statsObj.total +
        '</br>a one in ' + statsObj.oneInChance + ' chance' + end
    );
}

function getDiceListString(diceTableName) {
    return diceTableName.slice("<DiceTable containing ".length, -1);
}
