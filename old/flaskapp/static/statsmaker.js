function getStats(rollMantissaExponentObjects, rollsQueryArray) {
    const sciNumObj = createSciNumObj(rollMantissaExponentObjects);
    return getStatsFromSciNumObj(sciNumObj, rollsQueryArray)
}

function createSciNumObj(rollMantissaExponentObjects) {
    const outObj = {};
    const forTotal = [];
    rollMantissaExponentObjects.forEach((element) => {
        const number = new SciNum(element.mantissa, element.exponent);
        outObj[element.roll] = number;
        forTotal.push(number);
    });

    outObj["total"] = sumSciNum(forTotal);

    return outObj;
}

function getStatsFromSciNumObj(sciNumObj, rollsQueryArray) {
    const sciNumArr = rollsQueryArray.map(function (roll) {
        return getSciNumValue(sciNumObj, roll);
    });
    return createStatsObj(sciNumObj.total, sciNumArr);
}

function getSciNumValue(obj, key) {
    return obj.hasOwnProperty(key) ? obj[key] : new SciNum(0, 0);
}

function createStatsObj(total, sciNumArr) {
    const statsObj = {};
    const arrSum = sumSciNum(sciNumArr);
    statsObj.occurrences = arrSum.toFancyStr();
    statsObj.oneInChance = total.div(arrSum).toFancyStr();
    const pct = arrSum.div(total).mul(new SciNum(1, 2));
    statsObj.pctChance = pct.toFancyStr();
    statsObj.total = total.toFancyStr();
    return statsObj;
}

