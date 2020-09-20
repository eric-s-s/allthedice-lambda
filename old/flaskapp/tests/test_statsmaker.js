QUnit.test("createStatsObj positive poswers commaed", function (assert) {
    const arrVals = [new SciNum(1, 4), new SciNum(2, 3)];
    const total = new SciNum(2.4, 5);
    const expected = {total: "240,000", occurrences: "12,000", oneInChance: "20.00", pctChance: "5.000"};
    assert.deepEqual(
        createStatsObj(total, arrVals),
        expected,
        "all answers commaed notation"
    );
});

QUnit.test("createStatsObj large numbers large chance", function (assert) {
    const arrVals = [new SciNum(1, 0), new SciNum(1, 100)];
    const total = new SciNum(2.0000, 100);
    const expected = {total: "2.000e+100", occurrences: "1.000e+100", oneInChance: "2.000", pctChance: "50.00"};
    assert.deepEqual(
        createStatsObj(total, arrVals),
        expected,
        "one element larger than others"
    );
});

QUnit.test("createStatsObj large numbers small chance", function (assert) {
    const arrVals = [new SciNum(4, 100), new SciNum(1, 100)];
    const total = new SciNum(2.0000, 10000);
    const expected = {
        total: "2.000e+10000", occurrences: "5.000e+100",
        oneInChance: "4.000e+9899", pctChance: "2.500e-9898"
    };
    assert.deepEqual(
        createStatsObj(total, arrVals),
        expected,
        "total is much bigger."
    );
});

QUnit.test("createStatsObj very small numbers", function (assert) {
    const total = new SciNum(1.000, -500);
    const arrVals = [new SciNum(5.000, -502), new SciNum(2.000, -501)];
    const expected = {
        total: "1.000e-500", occurrences: "2.500e-501",
        oneInChance: "4.000", pctChance: "25.00"
    };
    assert.deepEqual(
        createStatsObj(total, arrVals),
        expected
    );
});

QUnit.test("createStatsObj low positive powers", function (assert) {
    const total = new SciNum(1.000, 2);
    const arrVals = [new SciNum(5.0, 0), new SciNum(1.5, 1)];
    const expected = {
        total: "100.0", occurrences: "20.00",
        oneInChance: "5.000", pctChance: "20.00"
    };
    assert.deepEqual(
        createStatsObj(total, arrVals),
        expected
    );
});

QUnit.test("createStatsObj zero value", function (assert) {
    const total = new SciNum(1.000, 2);
    const arrVals = [new SciNum(0, 0), new SciNum(0, 1)];
    const expected = {
        total: "100.0", occurrences: "0.000",
        oneInChance: "+\u221E", pctChance: "0.000"
    };
    assert.deepEqual(
        createStatsObj(total, arrVals),
        expected
    );
});

QUnit.test("createSciNumObj", function (assert) {
    const inputObj = [{roll: '1', mantissa: '1.23', exponent: '10'}, {roll: '2', mantissa: '1.23', exponent: '11'}];
    const expected = {
        '1': new SciNum('1.23', '10'), 2: new SciNum('1.23', '11'),
        'total': new SciNum(1.353, 11)
    };
    assert.deepEqual(createSciNumObj(inputObj), expected);

});

QUnit.test("createSciNumObj values are nums", function (assert) {
    const inputObj = [{roll: 1, mantissa: 1.23, exponent: 10}, {roll: 2, mantissa: 1.23, exponent: 11}];
    const expected = {
        '1': new SciNum('1.23', '10'), 2: new SciNum('1.23', '11'),
        'total': new SciNum(1.353, 11)
    };
    assert.deepEqual(createSciNumObj(inputObj), expected);

});

QUnit.test("getSciNumValue obj has value", function (assert) {
    const toTest = new SciNum(1, 2);
    const objUsingNum = {1: toTest};
    const objUsingStr = {"1": toTest};
    assert.deepEqual(getSciNumValue(objUsingNum, 1), toTest, "num key called with num");
    assert.deepEqual(getSciNumValue(objUsingNum, '1'), toTest, "num key called with str");
    assert.deepEqual(getSciNumValue(objUsingStr, 1), toTest, "str key called with num");
    assert.deepEqual(getSciNumValue(objUsingStr, '1'), toTest, "str key called with str");

});

QUnit.test("getSciNumValue obj doesn't have value", function (assert) {
    const toTest = new SciNum(1, 2);
    const zeroSciNum = new SciNum(0, 0);
    const objUsingNum = {1: toTest};
    const objUsingStr = {"1": toTest};
    assert.deepEqual(getSciNumValue(objUsingNum, 2), zeroSciNum, "num key called with num");
    assert.deepEqual(getSciNumValue(objUsingNum, '2'), zeroSciNum, "num key called with str");
    assert.deepEqual(getSciNumValue(objUsingStr, 2), zeroSciNum, "str key called with num");
    assert.deepEqual(getSciNumValue(objUsingStr, '2'), zeroSciNum, "str key called with str");

});

QUnit.test("getStatsFromSciNumObj arr is all keys in obj", function (assert) {
    const sciNumObj = {1: new SciNum(1, 1), 2: new SciNum(2, 1), 3: new SciNum(2, 1), total: new SciNum(5, 1)};
    const expected = {
        total: "50.00", occurrences: "50.00",
        oneInChance: "1.000", pctChance: "100.0"
    };
    assert.deepEqual(getStatsFromSciNumObj(sciNumObj, ['1', '2', '3']), expected, "with str array");
    assert.deepEqual(getStatsFromSciNumObj(sciNumObj, [1, 2, 3]), expected, "with num array");
});

QUnit.test("getStatsFromSciNumObj arr is no keys in obj", function (assert) {
    const sciNumObj = {1: new SciNum(1, 1), 2: new SciNum(2, 1), 3: new SciNum(2, 1), total: new SciNum(5, 1)};
    const expected = {
        total: "50.00", occurrences: "0.000",
        oneInChance: "+\u221E", pctChance: "0.000"
    };
    assert.deepEqual(getStatsFromSciNumObj(sciNumObj, [5, 6, 7]), expected, "with str array");
    assert.deepEqual(getStatsFromSciNumObj(sciNumObj, ['a', 'b']), expected, "with num array");
});

QUnit.test("getStatsFromSciNumObj arr is empty", function (assert) {
    const sciNumObj = {1: new SciNum(1, 1), 2: new SciNum(2, 1), 3: new SciNum(2, 1), total: new SciNum(5, 1)};
    const expected = {
        total: "50.00", occurrences: "0.000",
        oneInChance: "+\u221E", pctChance: "0.000"
    };
    assert.deepEqual(getStatsFromSciNumObj(sciNumObj, []), expected);
});

QUnit.test("getStatsFromSciNumObj arr is some keys in obj.", function (assert) {
    const sciNumObj = {1: new SciNum(1, 1), 2: new SciNum(2, 1), 3: new SciNum(2, 1), total: new SciNum(5, 1)};
    const expected = {
        total: "50.00", occurrences: "30.00",
        oneInChance: "1.667", pctChance: "60.00"
    };
    assert.deepEqual(getStatsFromSciNumObj(sciNumObj, [0, 1, 2]), expected, "with str array");
});

QUnit.test("getStatsFromSciNumObj large numbers large occurrences", function (assert) {
    const sciNumObj = {
        1: new SciNum(1, 1000), 2: new SciNum(2, 1000), 3: new SciNum(2, 1000),
        total: new SciNum(5, 1000)
    };
    const expected = {
        total: "5.000e+1000", occurrences: "3.000e+1000",
        oneInChance: "1.667", pctChance: "60.00"
    };
    assert.deepEqual(getStatsFromSciNumObj(sciNumObj, [0, 1, 2]), expected);
});

QUnit.test("getStatsFromSciNumObj large numbers small occurrences", function (assert) {
    const sciNumObj = {
        1: new SciNum(1, 1), 2: new SciNum(2, 1), 3: new SciNum(2, 1000),
        total: new SciNum(2, 1000)
    };
    const expected = {
        total: "2.000e+1000", occurrences: "30.00",
        oneInChance: "6.667e+998", pctChance: "1.500e-997"
    };
    assert.deepEqual(getStatsFromSciNumObj(sciNumObj, [0, 1, 2]), expected);
});

QUnit.test("getStats properly combines two functions", function (assert) {
    const forSciNumArray = [
        {roll: 1, mantissa: 1, exponent: 1},
        {roll: 2, mantissa: 2, exponent: 1},
        {roll: 3, mantissa: 2, exponent: 1}
    ];
    const expected = {
        total: "50.00", occurrences: "50.00",
        oneInChance: "1.000", pctChance: "100.0"
    };
    assert.deepEqual(getStats(forSciNumArray, ['1', '2', '3']), expected, "with str array");
    assert.deepEqual(getStats(forSciNumArray, [1, 2, 3]), expected, "with num array");
});

