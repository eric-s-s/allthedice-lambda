QUnit.test("onPageLoad first table not hidden, others are.", function (assert) {
    $.holdReady(true);
    onPageLoad();
    const allTables = $('.tableRequest');
    const shownTables = $('.tableRequest:visible');
    const hiddentables = $('.tableRequest:hidden');

    assert.equal(shownTables.length, 1, 'only one shown table');
    assert.equal(shownTables[0], allTables[0], 'the shown table is the first table');
    for (let mainIndex = 1; mainIndex < allTables.length; mainIndex++) {
        assert.equal(allTables[mainIndex], hiddentables[mainIndex - 1]);
    }
});

QUnit.test("onPageLoad first statsForm not hidden, others are.", function (assert) {
    $.holdReady(true);
    onPageLoad();
    const allTables = $('.statsRequest');
    const shownStats = $('.statsRequest:visible');
    const hiddenStats = $('.statsRequest:hidden');

    assert.equal(shownStats.length, 1, 'only one shown statsForm');
    assert.equal(shownStats[0], allTables[0], 'the shown statsForm is the first one.');
    for (let mainIndex = 1; mainIndex < allTables.length; mainIndex++) {
        assert.equal(allTables[mainIndex], hiddenStats[mainIndex - 1]);
    }
});

QUnit.test("onPageLoad all tableObj 'data('tableObj') = null", function (assert) {
    $.holdReady(true);
    onPageLoad();
    $('.tableRequest').each(function () {
        assert.strictEqual($(this).data('tableObj'), null);
    });
});

QUnit.test("onPageLoad all tableRequest.data('rollResults') are set to []", function (assert) {
    $.holdReady(true);
    onPageLoad();
    $('.tableRequest').each(function () {
        assert.deepEqual($(this).data('rollResults'), []);
    })
});


QUnit.test("setUpHiddenForms hides all forms and stores id's in order as data", function (assert) {
    $.holdReady(true);
    const toPlaceIn = $('#answer');
    const placedClass = $('.tableRequest');
    placedClass.each(function () {
        $(this).show();
    });

    setUpHiddenForms(toPlaceIn, placedClass);
    assert.deepEqual(toPlaceIn.data('hiddenForms'), ['table-0', 'table-1', 'table-2']);
    placedClass.each(function () {
        assert.ok($(this).is(':hidden'));
    });

});

QUnit.test("showHiddenForm returns next idstr", function (assert) {
    $.holdReady(true);
    onPageLoad();
    const tableArea = $("#tableRequestArea");
    assert.deepEqual(tableArea.data('hiddenForms'), ['table-1', 'table-2']);
    assert.strictEqual(showHiddenForm(tableArea), 'table-1', 'returns next table');
    assert.strictEqual(showHiddenForm(tableArea), 'table-2', 'returns next table');
    assert.strictEqual(showHiddenForm(tableArea), null, 'out of tables, returns null');
    assert.strictEqual(showHiddenForm(tableArea), null, 'still out of tables, returns null');
});

QUnit.test("showHiddenForm shows next table", function (assert) {
    $.holdReady(true);
    onPageLoad();
    const tableArea = $("#tableRequestArea");
    const table1 = $("#table-1");
    const table2 = $("#table-2");

    assert.ok(table1.is(':hidden'), 'table1 starts hidden');
    assert.ok(table2.is(':hidden'), 'table2 starts hidden');

    showHiddenForm(tableArea);

    assert.ok(table1.is(':visible'), 'table1 visible');
    assert.ok(table2.is(':hidden'), 'table2 hidden');

    showHiddenForm(tableArea);

    assert.ok(table1.is(':visible'), 'table1 visible');
    assert.ok(table2.is(':visible'), 'table2 visible');
});

QUnit.test("setUpExample alters text in next open tableForm", function (assert) {
    $.holdReady(true);
    onPageLoad();
    const table_0 = $('#table-0');
    const table_1 = $('#table-1');

    assert.ok(table_0.is(':visible'));
    assert.ok(table_1.is(':hidden'));

    const table_element = setUpExample('Die(6)');
    assert.strictEqual(table_element, table_1[0]);

    assert.ok(table_1.is(':visible'));
    assert.strictEqual(table_element.tableQuery.value, 'Die(6)');
});

QUnit.test("setUpExample will write to first visible tableForm if all full", function (assert) {
    $.holdReady(true);
    onPageLoad();
    const table_0 = $('#table-0');

    const testStr = 'test';

    setUpExample(testStr);
    setUpExample(testStr);
    assert.notEqual(table_0[0].tableQuery.value, testStr);

    const answer = setUpExample(testStr);
    assert.strictEqual(answer, table_0[0]);
    assert.strictEqual(table_0[0].tableQuery.value, testStr);

});

QUnit.test("setUpExample will keep writing to first visible tableForm if all full", function (assert) {
    $.holdReady(true);
    onPageLoad();
    const table_0 = $('#table-0');

    const testStr = 'test';
    const newTestStr = 'new test';

    setUpExample(testStr);
    setUpExample(testStr);
    assert.notEqual(table_0[0].tableQuery.value, testStr);

    setUpExample(testStr);
    assert.strictEqual(table_0[0].tableQuery.value, testStr);

    setUpExample(newTestStr);
    assert.strictEqual(table_0[0].tableQuery.value, newTestStr);
});


function initTest() {
    $.holdReady(true);
    const allTableRequests = $('.tableRequest');
    allTableRequests.data('tableObj', null);
    allTableRequests.each(function () {
        $(this).data('rollResults', []);
    });
    $('#tableRequestArea').data('hiddenForms', []);
    $('#statsRequestArea').data('hiddenForms', []);
    Plotly.newPlot(document.getElementById('plotter'), [{x: [0], y: [0]}]);
    getRangesForStats();
    emptyStatsTable();
}

QUnit.test('plotCurrentTables no tables have data', function (assert) {
    initTest();

    plotCurrentTables();
    const graphData = document.getElementById('plotter').data;
    assert.ok(graphData === undefined || graphData.length === 0);
});

QUnit.test('plotCurrentTables removes data that is not a table', function (assert) {
    initTest();

    const graphDiv = document.getElementById('plotter');
    Plotly.newPlot(graphDiv, [{x: [1, 2, 3], y: [4, 5, 6]}]);
    assert.equal(graphDiv.data.length, 1, 'confirm it has graph data');

    plotCurrentTables();

    assert.equal(graphDiv.data.length, 0, 'confirm it no graph data');
});

QUnit.test('plotCurrentTables tables have data', function (assert) {
    initTest();

    $("#table-0").data('tableObj', testResponse0);
    $('#table-1').data('tableObj', testResponse1);
    plotCurrentTables();
    const graphData = document.getElementById('plotter').data;
    assert.equal(graphData.length, 2);
    assert.equal(graphData[0].x, testResponse0.data.x);
    assert.equal(graphData[0].y, testResponse0.data.y);
    assert.equal(graphData[1].x, testResponse1.data.x);
    assert.equal(graphData[1].y, testResponse1.data.y);
});

QUnit.test('plotCurrentTables tables gets new min and max', function (assert) {
    initTest();

    $("#table-0").data('tableObj', testResponse0);
    $('#table-1').data('tableObj', testResponse2);
    plotCurrentTables();
    assert.deepEqual(testResponse0.range, [1, 3]);
    assert.deepEqual(testResponse2.range, [2, 10]);

    $('.statsInput').each(function () {
        assert.equal(this.min, 1);
        assert.equal(this.max, 10);
    });
});

QUnit.test('plotCurrentTables mode set according to cutoff', function (assert) {
    initTest();
    const xVals0 = [];
    const xVals1 = [];
    const yVals0 = [];
    const yVals1 = [];
    for (let value = 0; value < 100; value++) {
        xVals0.push(value);
        xVals1.push(value);
        yVals0.push(value * 2);
        yVals1.push(value * 2);
    }
    xVals1.push(100);
    yVals1.push(200);
    const tableObj0 = {
        "name": "object0",
        "diceStr": 'object0',
        "data": {"x": xVals0, "y": yVals0}
    };
    const tableObj1 = {
        "name": "object1",
        "diceStr": 'object1',
        "data": {x: xVals1, y: yVals1}
    };
    $('#table-0').data('tableObj', tableObj0);
    $('#table-1').data('tableObj', tableObj1);
    plotCurrentTables();

    const data = document.getElementById('plotter').data;
    assert.equal(data[0].mode, "lines+markers", 'data with 100pts or less uses markers');
    assert.equal(data[1].mode, "lines", 'data with over 100pts does not use markers');
});

QUnit.test('getRangesForStats sets min/max/value to 0 if data is empty', function (assert) {
    initTest();
    plotCurrentTables(); // set up empty data.
    assert.equal(document.getElementById('plotter').data.length, 0);
    getRangesForStats();
    $('.statsInput').each(function () {
        assert.equal(this.value, 0);
        assert.equal(this.min, 0);
        assert.equal(this.max, 0);
    });
});

QUnit.test('getRangesForStats sets min/max/value to single x val if all data has same val.', function (assert) {
    initTest();
    const allStat = $('.statsInput');
    const graphDiv = document.getElementById('plotter');

    Plotly.newPlot(graphDiv, [{x: [1], y: [100]}, {x: [1], y: [-100]}, {x: [1], y: [-100]}]);
    getRangesForStats();
    allStat.each(function () {
        assert.equal(this.value, 1, 'positive number');
        assert.equal(this.min, 1, 'positive number');
        assert.equal(this.max, 1, 'positive number');
    });

    Plotly.newPlot(graphDiv, [{x: [-1], y: [100]}, {x: [-1], y: [-100]}, {x: [-1], y: [-100]}]);
    getRangesForStats();
    allStat.each(function () {
        assert.equal(this.value, -1, 'negative number');
        assert.equal(this.min, -1, 'negative number');
        assert.equal(this.max, -1, 'negative number');
    });
});

QUnit.test('getRangesForStats sets min/value to min x. max to max x', function (assert) {
    initTest();
    const allStat = $('.statsInput');
    const graphDiv = document.getElementById('plotter');

    Plotly.newPlot(graphDiv, [{x: [1, 2], y: [1, -1]}, {x: [2, 5], y: [-2, 2]}, {x: [3, 4], y: [-3, 3]}]);
    getRangesForStats();
    allStat.each(function () {
        assert.equal(this.value, 1, 'positive number');
        assert.equal(this.min, 1, 'positive number');
        assert.equal(this.max, 5, 'positive number');
    });

    Plotly.newPlot(graphDiv, [{x: [-1, -2], y: [1, -1]}, {x: [-2, -5], y: [-2, 2]}, {x: [-3, -4], y: [-3, 3]}]);
    getRangesForStats();
    allStat.each(function () {
        assert.equal(this.value, -5, 'negative number');
        assert.equal(this.min, -5, 'negative number');
        assert.equal(this.max, -1, 'negative number');
    });
});

QUnit.test('emptyStatsTable hides all table rows that are not .keeper class', function (assert) {
    initTest();
    const statsTable = $('#statsTable');
    statsTable.append('<tr><th>removed</th></tr>');
    statsTable.append('<tr class="keeper"><th>Kept</th></tr>');
    assert.equal(statsTable.find('tr:visible').length, 6, 'initial setup');
    emptyStatsTable();
    assert.equal(statsTable.find('tr:visible').length, 5, 'hid non-keeper class');
    statsTable.find('tr:visible').each(function () {
        assert.equal(this.className, 'keeper', 'only keeper class is visible.');
    });
});

QUnit.test('emptyStatsTable keeps header elements and removes other elements', function (assert) {
    initTest();
    const statsTable = $('#statsTable');
    statsTable.append('<tr>to remove</tr>');
    statsTable.find('tr').append('<td>rm</td>');
    emptyStatsTable();
    assert.equal(statsTable.find('td').length, 0);
    const expectedHeaders = ['Table Name', 'Table Range', 'Mean', 'Std Dev'];
    statsTable.find('th:visible').each(function () {
        assert.ok(expectedHeaders.indexOf(this.innerHTML) !== -1, 'table header elements in array, expectedHeaders');
    });
});

QUnit.test('getTableObjStats', function (assert) {
    let toTest;
    const tableObj = {
        "name": "<DiceTable containing [1D4  W:10]>",
        "diceStr": 'WeightedDie({1: 1, 4: 9})',
        "data": [[1, 2, 3, 4], [10.0, 20.0, 50.0, 20.0]],
        "tableString": "1: 1\n2: 2\n3: 5\n4: 2\n",
        "forSciNum": {"1": ["1.00000", "0"], "2": ["2.00000", "0"], "3": ["5.00000", "0"], "4": ["2.00000", "0"]},
        "range": [1, 4],
        "mean": 2.8,
        "stddev": 0.8718
    };
    const expectedColors = [
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

    const baseObj = {
        tableName: ("<td class='tooltip' style='color:black'>[1D4  W:10]" +
            "<span class='tooltiptext'>WeightedDie({1: 1, 4: 9})</span></td>"),
        tableMean: "<td style='color:black'>2.8</td>",
        tableRange: "<td style='color:black'>1 to 4</td>",
        tableStdDev: "<td style='color:black'>0.8718</td>"
    };

    function applyColor(baseObj, color) {
        const newObj = {};
        for (const property in baseObj) {
            if (baseObj.hasOwnProperty(property)) {
                newObj[property] = baseObj[property].replace('black', color);
            }
        }
        return newObj;
    }

    for (let i = 0; i < 10; i++) {
        toTest = applyColor(baseObj, expectedColors[i]);
        assert.deepEqual(toTest, getTableObjStats(tableObj, i));
    }
    toTest = applyColor(baseObj, expectedColors[1]);
    assert.deepEqual(toTest, getTableObjStats(tableObj, 11), 'color indices loop over color arr');
});

QUnit.test('getTableObjStats all \\n are replaced by \<\/br\>', function (assert) {
    const tableObj = {
        "name": "<DiceTable containing [1D4]>",
        "diceStr": 'line1\nline2\nline3',
        "range": [1, 4],
        "mean": 2.8,
        "stddev": 0.8718
    };
    const answer = getTableObjStats(tableObj, 0);
    const expectedName = ("<td class='tooltip' style='color:#1f77b4'>[1D4]" +
        "<span class='tooltiptext'>line1</br>line2</br>line3</span></td>");
    assert.equal(answer.tableName, expectedName);
});


QUnit.test('resetStatsTable', function (assert) {
    initTest();

    const tableName = $('#tableName');
    const tableRange = $('#tableRange');
    const tableMean = $('#tableMean');
    const tableStdDev = $('#tableStdDev');

    const table0 = $("#table-0");

    table0.data('tableObj', testResponse0);
    $('#table-1').data('tableObj', testResponse2);
    $('#rowFor-stats-0').show();

    resetStatsTable();

    assert.ok($('#statsTable').find('tr:visible').is('.keeper'), 'hides correct rows.');

    const expectedHeaders = ['[1D3]', '[1D4, 1D6]'];
    const expectedColors = [['#1f77b4', 'rgb(31, 119, 180)'], ['#ff7f0e', 'rgb(255, 127, 14)']];
    tableName.find('td').each(function (index) {
        assert.equal(this.innerHTML.indexOf(expectedHeaders[index]), 0, 'tableName text');
        assert.ok((this.style.color === expectedColors[index][0] || this.style.color === expectedColors[index][1]),
            'tableName color');
    });

    const expectedRange = ['1 to 3', '2 to 10'];
    tableRange.find('td').each(function (index) {
        assert.equal(this.innerHTML, expectedRange[index], 'tableRange');
    });

    const expectedMean = ['2', '6'];
    tableMean.find('td').each(function (index) {
        assert.equal(this.innerHTML, expectedMean[index], 'tableMean');
    });

    const expectedStdDev = ['0.816', '2.041'];
    tableStdDev.find('td').each(function (index) {
        assert.equal(this.innerHTML, expectedStdDev[index], 'tablestddev');
    });

    table0.data('tableObj', null);
    resetStatsTable();
    tableName.find('td').each(function (index) {
        assert.equal(this.innerHTML.indexOf('[1D4, 1D6]'), 0, 'Removed first tableObj - tableName text');
        assert.ok((this.style.color === '#1f77b4' || this.style.color === 'rgb(31, 119, 180)'),
            'Removed first tableObj -tableName color');
        assert.ok(index < 1, 'only one el tableName');
    });

    tableRange.find('td').each(function (index) {
        assert.equal(this.innerHTML, '2 to 10', 'Removed first tableObj - tableRange');
        assert.ok(index < 1, 'only one el tableRange');
    });

    tableMean.find('td').each(function (index) {
        assert.equal(this.innerHTML, '6', 'Removed first tableObj - tableMean');
        assert.ok(index < 1, 'only one el tableMean');
    });

    tableStdDev.find('td').each(function (index) {
        assert.equal(this.innerHTML, '2.041', 'Removed first tableObj - tablestddev');
        assert.ok(index < 1, 'only one el tableStdDev');
    });
});

QUnit.test("assignRoller on table JQuery.  assigns function that alters displays rolls", function (assert) {
    const table0 = $("#table-0");
    clearRollResults(table0);
    const roller = table0.find('.roller')[0];
    const display = table0.find('.rollDisplay')[0];

    const tableObj = {
        roller: {
            height: '1',
            aliases: [{primary: '1', alternate: '1', primaryHeight: '1'}]
        }
    };

    roller.click();
    assert.deepEqual(display.innerHTML, "None", "rollDisplay starts empty");


    table0.data('tableObj', tableObj);
    assignRoller(table0);
    roller.click();
    assert.deepEqual(display.innerHTML, "1", "rollDisplay altered by new click.");

    roller.click();
    let expected = "1<span class=\"tooltiptext numberList\">Previous<br>1<br></span>";
    assert.deepEqual(display.innerHTML, expected, "rollDisplay again altered by new click.");

    table0.data('tableObj', null);
    assignRoller(table0);
    roller.click();
    assert.deepEqual(display.innerHTML, expected, "click is unassigned when tableObj is null");
});

QUnit.test("assignRoller on table JQuery.  assigns function that alters rollResults", function (assert) {
    const table0 = $("#table-0");
    clearRollResults(table0);
    const roller = table0.find('.roller')[0];

    const tableObj = {
        roller: {
            height: '1',
            aliases: [{primary: '1', alternate: '1', primaryHeight: '1'}]
        }
    };

    const rollResults = table0.data('rollResults');
    roller.click();
    assert.deepEqual(rollResults, [], "rollResults starts empty");


    table0.data('tableObj', tableObj);
    assignRoller(table0);
    roller.click();
    assert.deepEqual(rollResults, ["1"], "rollResults altered by new click.");

    roller.click();
    assert.deepEqual(rollResults, ["1", "1"], "rollResults again altered by new click.");

    table0.data('tableObj', null);
    assignRoller(table0);
    roller.click();
    assert.deepEqual(rollResults, ["1", "1"], "click is unassigned when tableObj is null");
});

QUnit.test("assignRoller only affects specific rollResults", function (assert) {
    const table0 = $("#table-0");
    const roller0 = table0.find(".roller")[0];
    clearRollResults(table0);
    const rollResults0 = table0.data('rollResults');

    const table1 = $("#table-1");
    const roller1 = table1.find(".roller")[0];
    clearRollResults(table1);
    const rollResults1 = table1.data('rollResults');


    const tableObj = {
        roller: {
            height: '1',
            aliases: [{primary: '1', alternate: '1', primaryHeight: '1'}]
        }
    };
    table0.data('tableObj', tableObj);
    assignRoller(table0);

    roller0.click();
    roller1.click();
    assert.deepEqual(rollResults0, ["1"], "table0 click adds to table0");
    assert.deepEqual(rollResults1, [], "table0 click did not add to table1");

    table0.data('tableObj', null);
    table1.data('tableObj', tableObj);
    assignRoller(table0);
    assignRoller(table1);

    roller0.click();
    roller1.click();
    roller1.click();
    assert.deepEqual(rollResults0, ["1"], "table1 click did not add to table0");
    assert.deepEqual(rollResults1, ["1", "1"], "table1 click adds to table1");
});

QUnit.test("assignRollers", function (assert) {
    $('.tableRequest').each(function () {
        $(this).data('tableObj', null);
        clearRollResults($(this));
    });

    const table0 = $("#table-0");
    const roller0 = table0.find(".roller")[0];
    clearRollResults(table0);
    const rollResults0 = table0.data('rollResults');

    const table1 = $("#table-1");
    const roller1 = table1.find(".roller")[0];
    clearRollResults(table1);
    const rollResults1 = table1.data('rollResults');

    const tableObj = {
        roller: {
            height: '1',
            aliases: [{primary: '1', alternate: '1', primaryHeight: '1'}]
        }
    };
    const tableObj2 = {
        roller: {
            height: '1',
            aliases: [{primary: '2', alternate: '2', primaryHeight: '1'}]
        }
    };
    table0.data('tableObj', tableObj);
    table1.data('tableObj', null);
    assignRollers();

    roller0.click();
    roller1.click();
    assert.deepEqual(rollResults0, ["1"], "rollers assigned correctly");
    assert.deepEqual(rollResults1, [], "non roller assigned correctly");

    table0.data('tableObj', tableObj2);
    table1.data('tableObj', tableObj);
    assignRollers();

    roller0.click();
    roller1.click();
    roller1.click();
    assert.deepEqual(rollResults0, ["1", "2"], "table0 correctly re-assigned");
    assert.deepEqual(rollResults1, ["1", "1"], "table1 correctly re-assigned");
});

QUnit.test("displayRollResults empty results", function (assert) {
    const table0 = $('#table-0');
    table0.data('rollResults', []);
    displayRollResults(table0);
    assert.deepEqual(table0.find('.rollDisplay')[0].innerHTML, "None");
});

QUnit.test("displayRollResults single result", function (assert) {
    const table0 = $('#table-0');
    table0.data('rollResults', [2]);
    displayRollResults(table0);
    assert.deepEqual(table0.find('.rollDisplay')[0].innerHTML, '2');
});

QUnit.test("displayRollResults multiple result", function (assert) {
    const table0 = $('#table-0');
    table0.data('rollResults', [2, 3, 4]);
    displayRollResults(table0);
    const expected = "4<span class=\"tooltiptext numberList\">Previous<br>3<br>2<br></span>";
    assert.deepEqual(table0.find('.rollDisplay')[0].innerHTML, expected);
});

QUnit.test("displayRollResults does not mutate rollResults", function (assert) {
    const table0 = $('#table-0');
    table0.data('rollResults', [1, 2, 3]);
    displayRollResults(table0);
    assert.deepEqual(table0.data('rollResults'), [1, 2, 3]);
});

QUnit.test("clearRollResults", function (assert) {
    const table0 = $('#table-0');
    table0.data('rollResults', [1, 2, 3]);
    table0.find('.rollDisplay')[0].innerHTML = 'for test';
    clearRollResults(table0);
    assert.deepEqual(table0.data('rollResults'), [], "results are empty");
    assert.deepEqual(table0.find('.rollDisplay')[0].innerHTML, 'None');
});

QUnit.test('getTable retrieves data and calls processNewData on $(table) and data', function (assert) {
    initTest();

    const table0 = $('#table-0');

    const mockJaxIndex = 0;
    table0[0].tableQuery.value = mockJaxIndex;
    const expectedTestData = testResponseList[mockJaxIndex];

    const originalFunction = processNewData;

    let callCounter = 0;
    processNewData = function (tableRequestJQuery, data) {
        tableRequestJQuery.data('calledWith', data);
        callCounter++;
    };

    getTable(document.getElementById('table-0'));
    const done1 = assert.async();
    setTimeout(function () {
        assert.deepEqual(table0.data('calledWith'), expectedTestData,
            "table called with testResponse0 and expected data");
        assert.strictEqual(callCounter, 1, 'method called once');

        processNewData = originalFunction;
        done1();
    }, 500);
});

QUnit.test('processNewData assigns tableObj to TableRequest', function (assert) {
    initTest();

    const table0 = $("#table-0");

    processNewData(table0, testResponse0);

    assert.deepEqual(table0.data('tableObj'), testResponse0, 'works?');

    processNewData(table0, testResponse2);

    assert.deepEqual(table0.data('tableObj'), testResponse2, 'works?');
});

QUnit.test('processNewData plots current tables and resets StatsTable', function (assert) {
    initTest();

    const table0 = $('#table-0');
    const table1 = $('#table-1');

    table0[0].tableQuery.value = 0;
    table1[0].tableQuery.value = 1;

    const graphDiv = document.getElementById('plotter');
    const tableName = $('#tableName');

    assert.equal(tableName.find('td').length, 0, 'statsTable names is empty');

    processNewData(table0, testResponse0);
    const expectedNames = ['[1D3]'];

    assert.deepEqual(graphDiv.data[0].x, testResponse0.data.x, 'one graph x vals');
    assert.deepEqual(graphDiv.data[0].y, testResponse0.data.y, 'one graph y vals');
    assert.equal(graphDiv.data.length, 1, 'one graph data only one length');

    expectedNames.push('[1D5]');
    tableName.find('td').each(function (index) {
        assert.equal(this.innerHTML.indexOf(expectedNames[index]), 0, 'statsTable names are correct');
    });


    processNewData(table1, testResponse1);
    assert.deepEqual(graphDiv.data[0].x, testResponse0.data.x, 'first graph x vals');
    assert.deepEqual(graphDiv.data[0].y, testResponse0.data.y, 'first graph y vals');

    assert.deepEqual(graphDiv.data[1].x, testResponse1.data.x, 'second graph x vals');
    assert.deepEqual(graphDiv.data[1].y, testResponse1.data.y, 'second graph y vals');

    assert.equal(graphDiv.data.length, 2, 'data length 2');
    tableName.find('td').each(function (index) {
        assert.equal(this.innerHTML.indexOf(expectedNames[index]), 0, 'statsTable names are correct 2 names');
    });

});

QUnit.test('processNewData clears rolls and assigns rollers', function (assert) {
    initTest();

    const table0 = $('#table-0');
    const table1 = $('#table-1');
    const rollResults0 = table0.data('rollResults');
    const rollResults1 = table1.data('rollResults');
    rollResults0.push('a');
    rollResults1.push('a');

    processNewData(table0, testResponse0);
    assert.deepEqual(table0.data('rollResults'), [], "table0 rollResults reset");
    assert.deepEqual(table1.data('rollResults'), rollResults1, 'table1 rollResults not reset');

    table0.find('.roller')[0].click();
    assert.ok(["1", "2", "3"].includes(table0.data('rollResults')[0]), 'table0 roller rolls 1D3');

    table1.find('.roller')[0].click();
    assert.deepEqual(table1.data('rollResults'), rollResults1, "table1 has no roller assigned")

});

QUnit.test('getTable error code: 400', function (assert) {
    initTest();
    const tempAlert = window.alert;
    const expected = '400: BAD REQUEST\nerror type: royalFuckUp\ndetails: you done fucked up good.';
    let storage = '';
    window.alert = function (inputStr) {
        storage = inputStr;
    };
    const table0 = document.getElementById('table-0');
    table0.tableQuery.value = 'a';
    getTable(table0);
    const done = assert.async();
    setTimeout(function () {
        assert.deepEqual(storage, expected);
        window.alert = tempAlert;
        done();
    }, 500);
});
QUnit.test('hideTableForm test all actions', function (assert) {
    initTest();
    const table0 = $('#table-0');
    const table1 = $('#table-1');

    table0.data('tableObj', testResponse0);
    table1.data('tableObj', testResponse1);
    plotCurrentTables();
    resetStatsTable();

    const graphDiv = document.getElementById('plotter');
    const tableName = $('#tableName');

    hideTableForm('table-0');

    assert.ok(table0.is(':hidden'), 'tableForm is hidden');
    assert.strictEqual(table0.data('tableObj'), null, 'tableForm data set to null');
    assert.equal(graphDiv.data.length, 1, 'graphDiv doesn\'t contain the graph');
    assert.deepEqual(graphDiv.data[0].x, table1.data('tableObj').data.x, 'graphDiv info is table1 info: x');
    assert.deepEqual(graphDiv.data[0].y, table1.data('tableObj').data.y, 'graphDiv info is table1 info: y');
    assert.deepEqual($('#tableRequestArea').data('hiddenForms'), ['table-0'],
        'table put back into hiddenforms (testInit() makes "hiddenForms" an empty list)');
    tableName.find('td').each(function (index) {
        assert.ok(index < 1, 'only one name in tableName');
        assert.equal(this.innerHTML.indexOf('[1D5]'), 0, 'only name is from table-1');
    });

});
QUnit.test('hideTableForm clears rollResults and un-assigns roller', function (assert) {
    initTest();
    const table0 = $('#table-0');
    const table1 = $('#table-1');

    const tableObj0 = {
        roller: {
            height: '1',
            aliases: [{primary: '1', alternate: '1', primaryHeight: '1'}]
        }
    };
    const tableObj1 = testResponse0;

    table0.data('tableObj', tableObj0);
    table1.data('tableObj', tableObj1);
    assignRollers();

    table0.find('.roller').click();
    table1.find('.roller').click();

    assert.deepEqual(table0.data('rollResults'), ["1"], "table0 roll Results set up with one entry");

    const table1RollResults = table1.data('rollResults').slice();
    assert.deepEqual(table1RollResults.length, 1, "table1 rollResults set up with one entry");

    hideTableForm('table-0');
    assert.deepEqual(table0.data('rollResults'), [], "table0 rollResults reset");
    table0.find('.roller').click();
    assert.deepEqual(table0.data('rollResults'), [], "table0 roller un-assigned");

    assert.deepEqual(table1.data('rollResults'), table1RollResults, "table1 rollResults not reset");
    table1.find('.roller').click();
    assert.deepEqual(table1.data('rollResults').length, 2, "table1 roller still assigned");

});
QUnit.test('removeStatsTraces no presence in data.', function (assert) {
    initTest();
    const graphDiv = document.getElementById('plotter');
    let beforeData = graphDiv.data;
    Plotly.newPlot(graphDiv, [{x: [2], y: [2]}]);
    let afterData = graphDiv.data;
    assert.notDeepEqual(beforeData, afterData, 'confirm that data can change');

    beforeData = graphDiv.data;
    removeStatsTraces('random');
    afterData = graphDiv.data;
    assert.deepEqual(beforeData, afterData);

});

QUnit.test('removeStatsTraces removes traces. relies on special "statsGroup" value', function (assert) {
    initTest();
    const group1 = [{x: [1], y: [1], name: '1', statsGroup: 'gp1'}, {x: [2], y: [2], name: '2', statsGroup: 'gp1'}];
    const group2 = [{x: [3], y: [3], name: '3', statsGroup: 'gp2'}, {x: [4], y: [4], name: '4', statsGroup: 'gp2'}];
    const groupNull = [{x: [5], y: [5], name: '5'}, {x: [6], y: [6], name: '6'}];

    const graphDiv = document.getElementById('plotter');
    Plotly.newPlot(graphDiv, group1);
    Plotly.addTraces(graphDiv, group2);
    Plotly.addTraces(graphDiv, groupNull);

    assert.equal(graphDiv.data.length, 6, 'setup complete');

    removeStatsTraces('gp2');
    let expectedNames = ['1', '2', '5', '6'];
    expectedNames.forEach(function (element, index) {
        assert.strictEqual(graphDiv.data[index].name, element, 'confirming remaining traces after removing "gp2"');
    });

    removeStatsTraces('gp1');
    expectedNames = ['5', '6'];
    expectedNames.forEach(function (element, index) {
        assert.strictEqual(graphDiv.data[index].name, element,
            'confirming remaining traces after removing "gp1" & "gp2"');
    });

});

QUnit.test('hideStatsForm all actions', function (assert) {
    initTest();
    const statsArea = $('#statsRequestArea');
    const stats0 = $('#stats-0');
    const rowForStats0 = $('#rowFor-stats-0');

    showHiddenForm(statsArea);
    rowForStats0.show();

    const group1 = [{x: [3], y: [3], name: '3', statsGroup: 'stats-0'}, {
        x: [4],
        y: [4],
        name: '4',
        statsGroup: 'stats-0'
    }];
    const groupNull = [{x: [5], y: [5], name: '5'}, {x: [6], y: [6], name: '6'}];
    const graphDiv = document.getElementById('plotter');
    Plotly.newPlot(graphDiv, group1);
    Plotly.addTraces(graphDiv, groupNull);
    getRangesForStats();

    stats0[0].left.value = '6';
    stats0[0].right.value = '6';

    hideStatsForm('stats-0');

    assert.ok(stats0.is(":hidden"), 'statsForm is now hidden');
    assert.ok(rowForStats0.is(":hidden"), 'rowFor-stats-0 is now hidden');

    assert.equal(stats0[0].left.min, 3, 'left min reset');
    assert.equal(stats0[0].left.max, 6, 'left max reset');
    assert.equal(stats0[0].left.value, 3, 'left value reset');
    assert.equal(stats0[0].right.min, 3, 'right min reset');
    assert.equal(stats0[0].right.max, 6, 'right max reset');
    assert.equal(stats0[0].right.value, 3, 'right value reset');

    assert.deepEqual(statsArea.data('hiddenForms'), ['stats-0'], 'stats back in hiddenForms');

    assert.equal(graphDiv.data.length, 2, 'graphDiv has correct number of graphs');
    assert.equal(graphDiv.data[0].name, '5', 'graphDiv has correct graphs');
    assert.equal(graphDiv.data[1].name, '6', 'graphDiv has correct graphs');


});

QUnit.test('getRange', function (assert) {
    assert.deepEqual(getRange('8', '9'), [8, 9], 'converts str to int');
    assert.deepEqual(getRange('8', '10'), [8, 9, 10], 'correctly sorts as ints');
    assert.deepEqual(getRange('10', '8'), [8, 9, 10], 'correctly sorts as ints other way');
    assert.deepEqual(getRange('1', '1'), [1], 'single number');
    assert.deepEqual(getRange('1', '-1'), [-1, 0, 1], 'positive to negative');
    assert.deepEqual(getRange('-1', '1'), [-1, 0, 1], 'negative to positive');
});

QUnit.test('statsGraphVals', function (assert) {
    const tableObj = {
        "repr": "<DiceTable containing [1D4  W:10]>",
        "diceStr": 'WeightedDie({1: 1, 4: 9})',
        "data": {x: [1, 2, 3, 4], y: [10.0, 20.0, 50.0, 20.0]},
        "tableString": "1: 1\n2: 2\n3: 5\n4: 2\n",
        "forSciNum": [
            {roll: "1", mantissa: "1.00000", exponent: "0"},
            {roll: "2", mantissa: "2.00000", exponent: "0"},
            {roll: "3", mantissa: "5.00000", exponent: "0"},
            {roll: "4", mantissa: "2.00000", exponent: "0"}
        ],
        "range": [1, 4],
        "mean": 2.8,
        "stddev": 0.8718
    };

    const expected = {
        x: [1, 2, 3, 4], y: [10.0, 20.0, 50.0, 20.0], type: 'scatter', mode: 'none', fill: 'tozeroy',
        hoverinfo: 'skip'
    };

    let toTest = statsGraphVals([1, 2, 3, 4], tableObj);
    assert.deepEqual(toTest, expected, 'all x vals');

    expected.x = [1.52, 2, 3, 4];
    expected.y = [(10 * 0.48 + 20 * 0.52), 20.0, 50.0, 20.0];
    toTest = statsGraphVals([2, 3, 4], tableObj);
    assert.deepEqual(toTest, expected, 'query vals higher than min.');

    expected.x = [1, 2, 3, 3.48];
    expected.y = [10.0, 20.0, 50.0, (50 * 0.52 + 20.0 * 0.48)];
    toTest = statsGraphVals([1, 2, 3], tableObj);
    assert.deepEqual(toTest, expected, 'query vals lower than max.');

    expected.x = [2.52, 3, 3.48];
    expected.y = [(20 * 0.48 + 50 * 0.52), 50.0, (50 * 0.52 + 20.0 * 0.48)];
    toTest = statsGraphVals([3], tableObj);
    assert.deepEqual(toTest, expected, 'query vals singleton in middle.');

    expected.x = [1, 1.48];
    expected.y = [10.0, (10 * 0.52 + 20.0 * 0.48)];
    toTest = statsGraphVals([1], tableObj);
    assert.deepEqual(toTest, expected, 'query vals singleton at end.');
});


QUnit.test('statsGraphVals queryVals outside range of tableObj', function (assert) {
    const tableObj = {
        "data": {x: [1, 2], y: [50.0, 50.0]},
        "range": [1, 2],
    };

    const expected = {
        x: [1, 2], y: [50.0, 50.0],
        type: 'scatter', mode: 'none', fill: 'tozeroy', hoverinfo: 'skip'
    };

    let toTest = statsGraphVals([1, 2, 3, 4], tableObj);
    assert.deepEqual(toTest, expected, 'queryVals max is greater than tableObj range');

    toTest = statsGraphVals([0, 1, 2], tableObj);
    assert.deepEqual(toTest, expected, 'queryVals min is less than tableObj range');

    const expectedEmpty = {
        x: [], y: [], type: 'scatter', mode: 'none', fill: 'tozeroy', hoverinfo: 'skip'
    };
    toTest = statsGraphVals([-1, 0], tableObj);
    assert.deepEqual(toTest, expectedEmpty, 'queryVals min and max less than tableObj range');

    toTest = statsGraphVals([3, 4], tableObj);
    assert.deepEqual(toTest, expectedEmpty, 'queryVals min and max greater than tableObj range');

});

QUnit.test('statsGraphName tableObj has set name, pctString is any str and queryArr is in order', function (assert) {
    const tableObj = {'name': '<DiceTable containing [1D4  W:3, 2D6]>'};
    assert.equal(statsGraphName(tableObj, '1.23e-10', [2]), '[1D4  W:3, 2D6]: [2]: 1.23e-10%',
        'single query. pct str in number range');
    assert.equal(statsGraphName(tableObj, '1.23e-1000', [2]), '[1D4  W:3, 2D6]: [2]: 1.23e-1000%',
        'single query. pct str not in number range');
    assert.equal(statsGraphName(tableObj, '1.23e-1000', [2, 3, 4]), '[1D4  W:3, 2D6]: [2to4]: 1.23e-1000%',
        'multi query.');
    assert.equal(statsGraphName(tableObj, '1.23e-1000', [-4, -3, -2]), '[1D4  W:3, 2D6]: [-4to-2]: 1.23e-1000%',
        'multi query with negative numbers.');
});

QUnit.test('statsGraphColor relies on the final digit of statsFormId and where graph is in index', function (assert) {
    assert.equal(statsGraphColor(0, 'randomStuff-1'), 'rgba(41,129,190,0.5)', 'index 0 ending in 1');
    assert.equal(statsGraphColor(1, 'randomStuff-9'), 'rgba(265,127,4,0.5)', 'index 1 ending in 9');
    for (let i = 0; i < 10; i++) {
        for (let j = i + 1; j < 10; j++) {
            assert.notEqual(statsGraphColor(0, 'words-' + i), statsGraphColor(0, 'words-' + j),
                'color vals different for different form IDs')
        }
    }
});

QUnit.test('plotStats no tables contain tableObj so no change to graph data.', function (assert) {
    initTest();
    const graphDiv = document.getElementById('plotter');
    const beforeData = graphDiv.data;
    const stats0 = document.getElementById('stats-0');
    stats0.left.value = 5;
    stats0.right.value = 10;

    const tableEntries = plotStats(stats0);
    const afterData = graphDiv.data;

    assert.deepEqual(beforeData, afterData);
    assert.equal(tableEntries.length, 0, 'no table entries.');
});

QUnit.test('plotStats', function (assert) {
    let key;
    initTest();

    const graphDiv = document.getElementById('plotter');

    const table0 = $('#table-0');
    const table2 = $("#table-2");
    table0.data('tableObj', testResponse0);
    table2.data('tableObj', testResponse2);

    plotCurrentTables();
    assert.equal(graphDiv.data.length, 2, 'Setup has two traces in graph.');

    const stats0 = document.getElementById('stats-0');
    const stats1 = document.getElementById('stats-1');
    stats0.left.value = 1;
    stats0.right.value = 3;

    stats1.left.value = 5;
    stats1.right.value = 5;

    const tableEntry0 = plotStats(stats0);
    const expectedTableEntry = [
        {
            "header": "[1D3]",
            "occurrences": "3.000",
            "oneInChance": "1.000",
            "pctChance": "100.0",
            "total": "3.000"
        },
        {
            "header": "[1D4, 1D6]",
            "occurrences": "3.000",
            "oneInChance": "8.000",
            "pctChance": "12.50",
            "total": "24.00"
        }
    ];

    assert.equal(graphDiv.data.length, 4, 'graphDiv now has four traces');
    assert.deepEqual(tableEntry0, expectedTableEntry, 'tableEntry output is correct');
    let expected1D3GraphData =
        {
            "fill": "tozeroy",
            "fillcolor": "rgba(31,109,190,0.5)",
            "hoverinfo": "skip",
            "legendgroup": "Die(3): 1",
            "mode": "none",
            "name": "[1D3]: [1to3]: 100.0%",
            "statsGroup": "stats-0",
            "type": "scatter",
            "x": [
                1,
                2,
                3
            ],
            "y": [
                33.333333333333336,
                33.333333333333336,
                33.333333333333336
            ]
        };
    for (key in expected1D3GraphData) {
        assert.deepEqual(graphDiv.data[2][key], expected1D3GraphData[key], 'all parts but uid are equal. 1D3')
    }

    let expected1D41D6GraphData =
        {
            "fill": "tozeroy",
            "fillcolor": "rgba(255,117,24,0.5)",
            "hoverinfo": "skip",
            "legendgroup": "Die(4): 1\nDie(6): 1",
            "mode": "none",
            "name": "[1D4, 1D6]: [1to3]: 12.50%",
            "statsGroup": "stats-0",
            "type": "scatter",
            "x": [
                2,
                3,
                3.48
            ],
            "y": [
                4.166666666666667,
                8.333333333333334,
                10.333333333333334
            ]
        };
    for (key in expected1D41D6GraphData) {
        assert.deepEqual(graphDiv.data[3][key], expected1D41D6GraphData[key], 'all parts but uid are equal. [1D4, 1D6')
    }

    stats0.left.value = 2;
    stats0.right.value = 2;

    plotStats(stats0);

    assert.equal(graphDiv.data.length, 4, 'length did not change when regraphing same statsForm.');
    expected1D3GraphData = {
        "fill": "tozeroy",
        "fillcolor": "rgba(31,109,190,0.5)",
        "hoverinfo": "skip",
        "legendgroup": "Die(3): 1",
        "mode": "none",
        "name": "[1D3]: [2]: 33.33%",
        "statsGroup": "stats-0",
        "type": "scatter",
        "x": [
            1.52,
            2,
            2.48
        ],
        "y": [
            33.333333333333336,
            33.333333333333336,
            33.333333333333336
        ]
    };
    for (key in expected1D3GraphData) {
        assert.deepEqual(graphDiv.data[2][key], expected1D3GraphData[key], 'new 1D3 graph is equal')
    }

    expected1D41D6GraphData = {
        "fill": "tozeroy",
        "fillcolor": "rgba(255,117,24,0.5)",
        "hoverinfo": "skip",
        "legendgroup": "Die(4): 1\nDie(6): 1",
        "mode": "none",
        "name": "[1D4, 1D6]: [2]: 4.167%",
        "statsGroup": "stats-0",
        "type": "scatter",
        "x": [
            2,
            2.48
        ],
        "y": [
            4.166666666666667,
            6.166666666666667
        ]
    };
    for (key in expected1D41D6GraphData) {
        assert.deepEqual(graphDiv.data[3][key], expected1D41D6GraphData[key], 'new [1D4,1D6 graph is equal')
    }

    plotStats(stats1);
    assert.equal(graphDiv.data.length, 6, 'plotting new statsForm makes new traces.');

});

QUnit.test('getToolTipText', function (assert) {
    const statsObj = {
        header: '[1D6]',
        total: "10.00",
        occurrences: "50.00",
        oneInChance: "1.000",
        pctChance: "100.0"
    };
    const answer = getToolTipText(statsObj);
    const expected = (
        "<span class='tooltiptext'>occurrences: 50.00</br>out of total: 10.00</br>a one in 1.000 chance</span>"
    );
    assert.equal(expected, answer);
});

QUnit.test('getTableRow empty entries just return table header', function (assert) {
    initTest();
    const stats0 = document.getElementById('stats-0');
    let answer = getTableRow(stats0, []);
    assert.equal('<th>0 to 0</th>', answer, 'basic');

    stats0.left.value = '3';
    stats0.right.value = '5';
    answer = getTableRow(stats0, []);
    assert.equal('<th>3 to 5</th>', answer, 'left smaller than right');

    stats0.left.value = '5';
    stats0.right.value = '3';
    answer = getTableRow(stats0, []);
    assert.equal('<th>3 to 5</th>', answer, 'right smaller than left');

    stats0.left.value = '5';
    stats0.right.value = '5';
    answer = getTableRow(stats0, []);
    assert.equal('<th>5 to 5</th>', answer, 'right and left equal');
});


QUnit.test('getTableRow with entries', function (assert) {
    initTest();
    const statsObj0 = {header: '[1D6]', total: "10", occurrences: "2", oneInChance: "5", pctChance: "20"};
    const statsObj1 = {header: '[2D8]', total: "12", occurrences: "3", oneInChance: "4", pctChance: "25"};
    const tooltip0 = getToolTipText(statsObj0);
    const tooltip1 = getToolTipText(statsObj1);
    const header = "<th>0 to 0</th>";
    const expected0 = "<td class='tooltip'>20 %" + tooltip0 + '</td>';
    const expected1 = "<td class='tooltip'>25 %" + tooltip1 + '</td>';
    assert.equal(
        getTableRow(document.getElementById('stats-0'), [statsObj0, statsObj1]),
        header + expected0 + expected1
    );

});

QUnit.test('showStatsRow', function (assert) {
    initTest();
    const rowForStats0 = $('#rowFor-stats-0');
    rowForStats0.hide();
    rowForStats0[0].innerHTML = "<th>whoops</th><td>ummmm</td>";

    const statsObj0 = {header: '[1D6]', total: "10", occurrences: "2", oneInChance: "5", pctChance: "20"};
    const statsObj1 = {header: '[2D8]', total: "12", occurrences: "3", oneInChance: "4", pctChance: "25"};
    const allTheText = (
        '20 %occurrences: 2out of total: 10a one in 5 chance25 %occurrences: 3out of total: 12a one in 4 chance'
    );


    showStatsRow(document.getElementById('stats-0'), [statsObj0, statsObj1]);
    assert.ok(rowForStats0.is(':visible'), 'row is shown');
    assert.equal(rowForStats0.find('td').text(), allTheText, 'row has all the expected text');
});

