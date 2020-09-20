const testResponse0 = {
    "data": {
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
    },
    "diceStr": "Die(3): 1",
    "forSciNum": [
        {
            "exponent": "0",
            "mantissa": "1.00000",
            "roll": 1
        },
        {
            "exponent": "0",
            "mantissa": "1.00000",
            "roll": 2
        },
        {
            "exponent": "0",
            "mantissa": "1.00000",
            "roll": 3
        }
    ],
    "mean": 2.0,
    "name": "<DiceTable containing [1D3]>",
    "range": [
        1,
        3
    ],
    "roller": {
        "aliases": [
            {
                "alternate": "3",
                "primary": "3",
                "primaryHeight": "3"
            },
            {
                "alternate": "2",
                "primary": "2",
                "primaryHeight": "3"
            },
            {
                "alternate": "1",
                "primary": "1",
                "primaryHeight": "3"
            }
        ],
        "height": "3"
    },
    "stddev": 0.816,
    "tableString": "1: 1\n2: 1\n3: 1\n"
};

const testResponse1 = {
    "data": {
        "x": [
            1,
            2,
            3,
            4,
            5
        ],
        "y": [
            20.0,
            20.0,
            20.0,
            20.0,
            20.0
        ]
    },
    "diceStr": "Die(5): 1",
    "forSciNum": [
        {
            "exponent": "0",
            "mantissa": "1.00000",
            "roll": 1
        },
        {
            "exponent": "0",
            "mantissa": "1.00000",
            "roll": 2
        },
        {
            "exponent": "0",
            "mantissa": "1.00000",
            "roll": 3
        },
        {
            "exponent": "0",
            "mantissa": "1.00000",
            "roll": 4
        },
        {
            "exponent": "0",
            "mantissa": "1.00000",
            "roll": 5
        }
    ],
    "mean": 3.0,
    "name": "<DiceTable containing [1D5]>",
    "range": [
        1,
        5
    ],
    "roller": {
        "aliases": [
            {
                "alternate": "5",
                "primary": "5",
                "primaryHeight": "5"
            },
            {
                "alternate": "4",
                "primary": "4",
                "primaryHeight": "5"
            },
            {
                "alternate": "3",
                "primary": "3",
                "primaryHeight": "5"
            },
            {
                "alternate": "2",
                "primary": "2",
                "primaryHeight": "5"
            },
            {
                "alternate": "1",
                "primary": "1",
                "primaryHeight": "5"
            }
        ],
        "height": "5"
    },
    "stddev": 1.414,
    "tableString": "1: 1\n2: 1\n3: 1\n4: 1\n5: 1\n"
};

const testResponse2 = {
    "data": {
        "x": [
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10
        ],
        "y": [
            4.166666666666667,
            8.333333333333334,
            12.5,
            16.666666666666668,
            16.666666666666668,
            16.666666666666668,
            12.5,
            8.333333333333334,
            4.166666666666667
        ]
    },
    "diceStr": "Die(4): 1\nDie(6): 1",
    "forSciNum": [
        {
            "exponent": "0",
            "mantissa": "1.00000",
            "roll": 2
        },
        {
            "exponent": "0",
            "mantissa": "2.00000",
            "roll": 3
        },
        {
            "exponent": "0",
            "mantissa": "3.00000",
            "roll": 4
        },
        {
            "exponent": "0",
            "mantissa": "4.00000",
            "roll": 5
        },
        {
            "exponent": "0",
            "mantissa": "4.00000",
            "roll": 6
        },
        {
            "exponent": "0",
            "mantissa": "4.00000",
            "roll": 7
        },
        {
            "exponent": "0",
            "mantissa": "3.00000",
            "roll": 8
        },
        {
            "exponent": "0",
            "mantissa": "2.00000",
            "roll": 9
        },
        {
            "exponent": "0",
            "mantissa": "1.00000",
            "roll": 10
        }
    ],
    "mean": 6.0,
    "name": "<DiceTable containing [1D4, 1D6]>",
    "range": [
        2,
        10
    ],
    "roller": {
        "aliases": [
            {
                "alternate": "8",
                "primary": "10",
                "primaryHeight": "9"
            },
            {
                "alternate": "7",
                "primary": "8",
                "primaryHeight": "12"
            },
            {
                "alternate": "7",
                "primary": "9",
                "primaryHeight": "18"
            },
            {
                "alternate": "6",
                "primary": "7",
                "primaryHeight": "18"
            },
            {
                "alternate": "6",
                "primary": "3",
                "primaryHeight": "18"
            },
            {
                "alternate": "6",
                "primary": "2",
                "primaryHeight": "9"
            },
            {
                "alternate": "5",
                "primary": "6",
                "primaryHeight": "9"
            },
            {
                "alternate": "4",
                "primary": "5",
                "primaryHeight": "21"
            },
            {
                "alternate": "4",
                "primary": "4",
                "primaryHeight": "24"
            }
        ],
        "height": "24"
    },
    "stddev": 2.041,
    "tableString": " 2: 1\n 3: 2\n 4: 3\n 5: 4\n 6: 4\n 7: 4\n 8: 3\n 9: 2\n10: 1\n"
};

const testResponse3 = {
    "data": {
        "x": [
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            11,
            12
        ],
        "y": [
            2.7777777777777777,
            5.555555555555555,
            8.333333333333334,
            11.11111111111111,
            13.888888888888888,
            16.666666666666668,
            13.888888888888888,
            11.11111111111111,
            8.333333333333334,
            5.555555555555555,
            2.7777777777777777
        ]
    },
    "diceStr": "Die(6): 2",
    "forSciNum": [
        {
            "exponent": "0",
            "mantissa": "1.00000",
            "roll": 2
        },
        {
            "exponent": "0",
            "mantissa": "2.00000",
            "roll": 3
        },
        {
            "exponent": "0",
            "mantissa": "3.00000",
            "roll": 4
        },
        {
            "exponent": "0",
            "mantissa": "4.00000",
            "roll": 5
        },
        {
            "exponent": "0",
            "mantissa": "5.00000",
            "roll": 6
        },
        {
            "exponent": "0",
            "mantissa": "6.00000",
            "roll": 7
        },
        {
            "exponent": "0",
            "mantissa": "5.00000",
            "roll": 8
        },
        {
            "exponent": "0",
            "mantissa": "4.00000",
            "roll": 9
        },
        {
            "exponent": "0",
            "mantissa": "3.00000",
            "roll": 10
        },
        {
            "exponent": "0",
            "mantissa": "2.00000",
            "roll": 11
        },
        {
            "exponent": "0",
            "mantissa": "1.00000",
            "roll": 12
        }
    ],
    "mean": 7.0,
    "name": "<DiceTable containing [2D6]>",
    "range": [
        2,
        12
    ],
    "roller": {
        "aliases": [
            {
                "alternate": "9",
                "primary": "12",
                "primaryHeight": "11"
            },
            {
                "alternate": "8",
                "primary": "9",
                "primaryHeight": "19"
            },
            {
                "alternate": "8",
                "primary": "11",
                "primaryHeight": "22"
            },
            {
                "alternate": "7",
                "primary": "8",
                "primaryHeight": "24"
            },
            {
                "alternate": "7",
                "primary": "10",
                "primaryHeight": "33"
            },
            {
                "alternate": "7",
                "primary": "4",
                "primaryHeight": "33"
            },
            {
                "alternate": "7",
                "primary": "3",
                "primaryHeight": "22"
            },
            {
                "alternate": "6",
                "primary": "7",
                "primaryHeight": "34"
            },
            {
                "alternate": "6",
                "primary": "2",
                "primaryHeight": "11"
            },
            {
                "alternate": "5",
                "primary": "6",
                "primaryHeight": "28"
            },
            {
                "alternate": "5",
                "primary": "5",
                "primaryHeight": "36"
            }
        ],
        "height": "36"
    },
    "stddev": 2.415,
    "tableString": " 2: 1\n 3: 2\n 4: 3\n 5: 4\n 6: 5\n 7: 6\n 8: 5\n 9: 4\n10: 3\n11: 2\n12: 1\n"
};


const testResponseList = [testResponse0, testResponse1, testResponse2, testResponse3];
