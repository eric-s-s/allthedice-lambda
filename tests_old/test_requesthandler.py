import string

import pytest
from dicetables import (
    DiceTable,
    DetailedDiceTable,
    DiceRecord,
    ParseError,
    LimitsError,
    InvalidEventsError,
    DiceRecordError,
    Die,
    ModDie,
    WeightedDie,
    ModWeightedDie,
    StrongDie,
    Exploding,
    ExplodingOn,
    Modifier,
    BestOfDicePool,
    WorstOfDicePool,
    LowerMidOfDicePool,
    UpperMidOfDicePool,
    DicePool,
)

from request_handler.dice_tables_tequest_handler import (
    DiceTablesRequestHandler,
    make_dict,
)


@pytest.fixture
def handler():
    return DiceTablesRequestHandler()


POOL = DicePool(Die(2), 2)
DICE_EXAMPLES = [
    Die(die_size=2),
    ModDie(2, modifier=-1),
    WeightedDie(dictionary_input={3: 4, 5: 6}),
    ModWeightedDie({1: 2, 3: 4}, 0),
    StrongDie(input_die=Die(2), multiplier=2),
    Exploding(Die(2), explosions=1),
    ExplodingOn(Die(3), explodes_on=(1, 2)),
    Modifier(modifier=-100),
    BestOfDicePool(POOL, 1),
    WorstOfDicePool(POOL, 1),
    UpperMidOfDicePool(POOL, 1),
    LowerMidOfDicePool(POOL, 1),
]


class TestRequestHandler(object):
    def test_allowed_delimiters(self):
        expected_allowed = "!\"#$%&'*+./;<>?@\\^`|~\t\n\r"
        assert DiceTablesRequestHandler.allowed_delimiters() == expected_allowed

    def test_init_defaults(self, handler):
        assert handler.max_dice_value == 12000
        assert handler.number_and_die_delimiter == "*"
        assert handler.die_set_delimiter == "&"

    def test_init_set_max_dice_value(self):
        handler = DiceTablesRequestHandler(2)
        assert handler.max_dice_value == 2

    def test_init_assign_delimiters(self):
        handler = DiceTablesRequestHandler(
            number_and_die_delimiter="$", die_set_delimiter="|"
        )
        assert handler.number_and_die_delimiter == "$"
        assert handler.die_set_delimiter == "|"

    def test_init_same_delimiter_not_allowed(self):
        with pytest.raises(ValueError):
            DiceTablesRequestHandler(
                number_and_die_delimiter="-", die_set_delimiter="-"
            )

    @pytest.mark.parametrize(
        "good_delimiter", DiceTablesRequestHandler.allowed_delimiters()
    )
    def test_init_all_good_delimiters(self, good_delimiter):
        other_delimiter = DiceTablesRequestHandler.allowed_delimiters()[0]
        if other_delimiter == good_delimiter:
            other_delimiter = DiceTablesRequestHandler.allowed_delimiters()[1]
        DiceTablesRequestHandler(
            die_set_delimiter=good_delimiter, number_and_die_delimiter=other_delimiter
        )

    @pytest.mark.parametrize(
        "bad_delimiter",
        [
            el
            for el in string.printable
            if el not in DiceTablesRequestHandler.allowed_delimiters()
        ],
    )
    def test_init_bad_delimiter(self, bad_delimiter):
        with pytest.raises(ValueError):
            DiceTablesRequestHandler(number_and_die_delimiter=bad_delimiter)

        with pytest.raises(ValueError):
            DiceTablesRequestHandler(die_set_delimiter=bad_delimiter)

    def test_create_dice_record_empty_string(self, handler):
        expected = DiceRecord.new()
        assert handler.create_dice_record("") == expected

    def test_create_dice_record_empty_whitespace_string(self, handler):
        expected = DiceRecord.new()
        assert handler.create_dice_record("   ") == expected

    @pytest.mark.parametrize("die", DICE_EXAMPLES)
    def test_create_single_dice_record(self, handler, die):
        expected = DiceRecord.new().add_die(die, 1)
        assert handler.create_dice_record(repr(die)) == expected

    def test_create_dice_record_with_number(self, handler):
        expected = DiceRecord.new().add_die(Die(6), 3)
        assert handler.create_dice_record("3*Die(6)") == expected

    def test_create_dice_record_white_space(self, handler):
        expected = DiceRecord.new().add_die(Die(6), 3)
        assert handler.create_dice_record("  3  *  Die(6) ") == expected

    def test_create_dice_record_multiple_dice_without_number(self, handler):
        expected = DiceRecord.new().add_die(Die(6), 1).add_die(Die(5), 1)
        assert handler.create_dice_record("Die(5)&Die(6)") == expected

    def test_create_dice_record_multiple_dice_with_number(self, handler):
        expected = DiceRecord.new().add_die(Die(2), 2).add_die(Die(3), 3)
        assert handler.create_dice_record("3*Die(3) & 2*Die(2)") == expected

    def test_create_dice_record_with_kwargs(self, handler):
        expected = DiceRecord.new().add_die(ModDie(2, 3), 1)
        assert handler.create_dice_record("ModDie(die_size=2, modifier=3)") == expected

    def test_create_dice_record_mixed_case(self, handler):
        expected = DiceRecord.new().add_die(Die(3), 1)
        request = "dIe(DiE_sIzE=3)"
        assert handler.create_dice_record(request) == expected

    @pytest.mark.parametrize(
        "instructions, error",
        [
            ("2*Die(5) & *Die(4)", ValueError),
            ('3 * die("a")', ValueError),
            ("* Die(4)", ValueError),
            ("WeightedDie({-1: 1})", ValueError),
            ("Die(4) * 3 * Die(5)", ValueError),
            ("2 * die(5) $ 4 * die(6)", ValueError),
            ("3 die(3)", SyntaxError),
            ("4 $ die(5)", SyntaxError),
            ("die(5", SyntaxError),
            ("3 * moddie(2)", ParseError),
            ("die(1, 2, 3)", ParseError),
            ("notadie(5)", ParseError),
            ("die(30000)", LimitsError),
            ("-2*die(2)", DiceRecordError),
            ("3 & die(3)", AttributeError),
            ("WeightedDie({1, 2})", AttributeError),
            ("WeightedDie({1: -1})", InvalidEventsError),
            ("die(-1)", InvalidEventsError),
        ],
    )
    def test_create_dice_record_each_error_raised(self, handler, instructions, error):
        with pytest.raises(error):
            handler.create_dice_record(instructions)

    def test_assert_dice_record_within_limits_no_error(self):
        handler = DiceTablesRequestHandler(max_dice_value=6)
        record = DiceRecord.new().add_die(Die(3), 2)
        handler.assert_dice_record_within_limits(record)

    def test_assert_dice_record_within_limits_error(self):
        handler = DiceTablesRequestHandler(max_dice_value=6)
        record = DiceRecord.new().add_die(Die(3), 1).add_die(Die(4), 1)
        with pytest.raises(ValueError):
            handler.assert_dice_record_within_limits(record)

    def test_assert_dice_record_within_limits_based_on_dictionary_size(self):
        handler = DiceTablesRequestHandler(max_dice_value=2)
        die = WeightedDie({1: 1, 10: 1})
        assert die.get_size() == 10
        assert len(die.get_dict()) == 2
        record = DiceRecord.new().add_die(die, 1)

        handler.assert_dice_record_within_limits(record)

    def test_assert_dice_record_within_limits_dictionary_example(self):
        die = Exploding(Die(6))
        assert len(die.get_dict()) == 16

        record = DiceRecord.new().add_die(die, 2)

        handler = DiceTablesRequestHandler(max_dice_value=32)
        handler.assert_dice_record_within_limits(record)

        handler_that_errors = DiceTablesRequestHandler(max_dice_value=31)
        with pytest.raises(ValueError):
            handler_that_errors.assert_dice_record_within_limits(record)

    @pytest.mark.parametrize("times, errors", [(1, False), (2, False), (3, True)])
    def test_assert_dice_record_measures_die_times(self, times, errors):
        max_dice_value = 2
        handler = DiceTablesRequestHandler(max_dice_value=max_dice_value)
        die = Die(1)
        record = DiceRecord.new().add_die(die, times)
        if errors:
            with pytest.raises(ValueError):
                handler.assert_dice_record_within_limits(record)
        else:
            handler.assert_dice_record_within_limits(record)

    def test_request_dice_table_construction_all_errors_are_caught(self, handler):
        errors = (
            ValueError,
            SyntaxError,
            AttributeError,
            IndexError,
            TypeError,
            ParseError,
            LimitsError,
            InvalidEventsError,
            DiceRecordError,
        )
        instructions = [
            "* Die(4)",
            "3 die(3)",
            "3 & die(3)",
            "Die(4) * 3 * Die(5)",
            "4 $ die(5)",
            "2 * die(5) $ 4 * die(6)",
            'die("a")',
            "die(5",
            "die(5000)",
            "notadie(5)",
            "die(1, 2, 3)",
            "WeightedDie({1, 2})",
            "WeightedDie({-1: 1})",
            "Die(-1)",
            "WeightedDie({1: -1})",
            "-2*Die(2)",
            "ModDie(2)",
        ]
        for instruction in instructions:
            with pytest.raises(errors):
                handler.request_dice_table_construction(instruction)

    def test_make_dict_simple_table(self, handler):
        answer = make_dict(DiceTable.new().add_die(Die(4)))
        expected = {
            "name": "<DiceTable containing [1D4]>",
            "diceStr": "Die(4): 1",
            "data": {"x": (1, 2, 3, 4), "y": (25.0, 25.0, 25.0, 25.0)},
            "tableString": "1: 1\n2: 1\n3: 1\n4: 1\n",
            "forSciNum": [
                {"roll": 1, "mantissa": "1.00000", "exponent": "0"},
                {"roll": 2, "mantissa": "1.00000", "exponent": "0"},
                {"roll": 3, "mantissa": "1.00000", "exponent": "0"},
                {"roll": 4, "mantissa": "1.00000", "exponent": "0"},
            ],
            "range": (1, 4),
            "mean": 2.5,
            "stddev": 1.118,
            "roller": {
                "height": "4",
                "aliases": [
                    {"primary": "4", "alternate": "4", "primaryHeight": "4"},
                    {"primary": "3", "alternate": "3", "primaryHeight": "4"},
                    {"primary": "2", "alternate": "2", "primaryHeight": "4"},
                    {"primary": "1", "alternate": "1", "primaryHeight": "4"},
                ],
            },
        }

        assert answer == expected

    def test_make_dict_large_number_table(self, handler):
        table = DiceTable({1: 1, 2: 9 ** 351}, DiceRecord.new())
        answer = make_dict(table)
        expected = {
            "data": {"x": (1, 2), "y": (0.0, 100.0)},
            "forSciNum": [
                {"roll": 1, "mantissa": "1.00000", "exponent": "0"},
                {"roll": 2, "mantissa": "8.69202", "exponent": "334"},
            ],
            "mean": 2.0,
            "range": (1, 2),
            "name": "<DiceTable containing []>",
            "diceStr": "",
            "stddev": 0.0,
            "tableString": "1: 1\n2: 8.692e+334\n",
            "roller": {
                "height": (
                    "8692021926532582239431197828370635593634075173099158789854434049807997760319275071636088"
                    "5895145922991572345585185250800940116508114750525076655926616148114182143549026229853337"
                    "9940869208919850517403157109776051593152797345404989883632793071982398710942373198113120"
                    "40403122389178667907944352945294284623021821750094845717881664249886010"
                ),
                "aliases": [
                    {"primary": "1", "alternate": "2", "primaryHeight": "2"},
                    {
                        "primary": "2",
                        "alternate": "2",
                        "primaryHeight": (
                            "8692021926532582239431197828370635593634075173099158789854434049807997760319"
                            "2750716360885895145922991572345585185250800940116508114750525076655926616148"
                            "1141821435490262298533379940869208919850517403157109776051593152797345404989"
                            "8836327930719823987109423731981131204040312238917866790794435294529428462302"
                            "1821750094845717881664249886010"
                        ),
                    },
                ],
            },
        }

        assert answer == expected

    def test_make_dict_complex_table(self, handler):
        table = (
            DiceTable.new().add_die(WeightedDie({1: 1, 2: 99}), 3).add_die(Die(3), 4)
        )
        answer = make_dict(table)
        expected = {
            "name": "<DiceTable containing [3D2  W:100, 4D3]>",
            "diceStr": "WeightedDie({1: 1, 2: 99}): 3\nDie(3): 4",
            "data": {
                "x": (7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18),
                "y": (
                    1.234567901234568e-06,
                    0.0003716049382716049,
                    0.03777901234567901,
                    1.3467864197530863,
                    5.16049012345679,
                    12.566786419753084,
                    19.861979012345678,
                    23.34457160493827,
                    19.53086790123457,
                    12.124566666666665,
                    4.8279,
                    1.1978999999999997,
                ),
            },
            "tableString": (
                " 7: 1\n"
                + " 8: 301\n"
                + " 9: 30,601\n"
                + "10: 1,090,897\n"
                + "11: 4,179,997\n"
                + "12: 1.018e+7\n"
                + "13: 1.609e+7\n"
                + "14: 1.891e+7\n"
                + "15: 1.582e+7\n"
                + "16: 9,820,899\n"
                + "17: 3,910,599\n"
                + "18: 970,299\n"
            ),
            "forSciNum": [
                {"roll": 7, "mantissa": "1.00000", "exponent": "0"},
                {"roll": 8, "mantissa": "3.01000", "exponent": "2"},
                {"roll": 9, "mantissa": "3.06010", "exponent": "4"},
                {"roll": 10, "mantissa": "1.09090", "exponent": "6"},
                {"roll": 11, "mantissa": "4.18000", "exponent": "6"},
                {"roll": 12, "mantissa": "1.01791", "exponent": "7"},
                {"roll": 13, "mantissa": "1.60882", "exponent": "7"},
                {"roll": 14, "mantissa": "1.89091", "exponent": "7"},
                {"roll": 15, "mantissa": "1.58200", "exponent": "7"},
                {"roll": 16, "mantissa": "9.82090", "exponent": "6"},
                {"roll": 17, "mantissa": "3.91060", "exponent": "6"},
                {"roll": 18, "mantissa": "9.70299", "exponent": "5"},
            ],
            "range": (7, 18),
            "mean": 13.97,
            "stddev": 1.642,
            "roller": {
                "aliases": [
                    {"alternate": "16", "primary": "18", "primaryHeight": "11643588"},
                    {"alternate": "15", "primary": "16", "primaryHeight": "48494376"},
                    {"alternate": "15", "primary": "17", "primaryHeight": "46927188"},
                    {"alternate": "15", "primary": "11", "primaryHeight": "50159964"},
                    {"alternate": "15", "primary": "10", "primaryHeight": "13090764"},
                    {"alternate": "14", "primary": "15", "primaryHeight": "24512328"},
                    {"alternate": "14", "primary": "9", "primaryHeight": "367212"},
                    {"alternate": "14", "primary": "8", "primaryHeight": "3612"},
                    {"alternate": "13", "primary": "14", "primaryHeight": "8792388"},
                    {"alternate": "13", "primary": "7", "primaryHeight": "12"},
                    {"alternate": "12", "primary": "13", "primaryHeight": "39850836"},
                    {"alternate": "12", "primary": "12", "primaryHeight": "81000000"},
                ],
                "height": "81000000",
            },
        }

        assert answer == expected

    def test_make_dict_mean_and_stddev_rounding(self, handler):
        table = DetailedDiceTable.new().add_die(WeightedDie({1: 1, 2: 2}))
        answer = make_dict(table)
        assert table.calc.mean() == 1.6666666666666667
        assert answer["mean"] == 1.667

        assert table.calc.stddev(3) == 0.471
        assert answer["stddev"] == 0.471

    def test_make_dict_can_handle_gaps(self, handler):
        table = DiceTable.new().add_die(WeightedDie({1: 1, 3: 1}))
        answer = make_dict(table)
        expected = {
            "name": "<DiceTable containing [1D3  W:2]>",
            "diceStr": "WeightedDie({1: 1, 2: 0, 3: 1}): 1",
            "data": {"x": (1, 2, 3), "y": (50.0, 0.0, 50.0)},
            "tableString": "1: 1\n2: 0\n3: 1\n",
            "forSciNum": [
                {"roll": 1, "mantissa": "1.00000", "exponent": "0"},
                {"roll": 2, "mantissa": "0", "exponent": "0"},
                {"roll": 3, "mantissa": "1.00000", "exponent": "0"},
            ],
            "range": (1, 3),
            "mean": 2,
            "stddev": 1.0,
            "roller": {
                "height": "2",
                "aliases": [
                    {"primary": "3", "alternate": "3", "primaryHeight": "2"},
                    {"primary": "1", "alternate": "1", "primaryHeight": "2"},
                ],
            },
        }
        assert answer == expected

    def test_get_response_empty_string_and_whitespace(self, handler):
        empty_str_answer = handler.get_response("")

        empty_response = {
            "data": {"x": (0,), "y": (100.0,)},
            "forSciNum": [{"roll": 0, "mantissa": "1.00000", "exponent": "0"}],
            "mean": 0.0,
            "range": (0, 0),
            "name": "<DiceTable containing []>",
            "diceStr": "",
            "stddev": 0.0,
            "tableString": "0: 1\n",
            "roller": {
                "aliases": [{"alternate": "0", "primary": "0", "primaryHeight": "1"}],
                "height": "1",
            },
        }
        assert empty_str_answer == empty_response

        whitespace_str_answer = handler.get_response("   ")
        assert whitespace_str_answer == empty_response

    def test_get_response(self, handler):
        response = handler.get_response("Die(2)")
        expected = {
            "diceStr": "Die(2): 1",
            "name": "<DiceTable containing [1D2]>",
            "data": {"x": (1, 2), "y": (50.0, 50.0)},
            "tableString": "1: 1\n2: 1\n",
            "forSciNum": [
                {"roll": 1, "mantissa": "1.00000", "exponent": "0"},
                {"roll": 2, "mantissa": "1.00000", "exponent": "0"},
            ],
            "range": (1, 2),
            "mean": 1.5,
            "stddev": 0.5,
            "roller": {
                "aliases": [
                    {"alternate": "2", "primary": "2", "primaryHeight": "2"},
                    {"alternate": "1", "primary": "1", "primaryHeight": "2"},
                ],
                "height": "2",
            },
        }
        assert response == expected

    @pytest.mark.parametrize(
        "instructions, expected",
        [
            (
                "2*Die(5) & *Die(4)",
                {
                    "error": "invalid literal for int() with base 10: ' '",
                    "type": "ValueError",
                },
            ),
            ("3 die(3)", {"error": "invalid syntax", "type": "SyntaxError"}),
            (
                '3 * die("a")',
                {"error": "Expected an integer, but got: 'a'", "type": "ValueError"},
            ),
            (
                "3 * moddie(1)",
                {
                    "error": "missing a required argument: 'modifier' for class: moddie",
                    "type": "ParseError",
                },
            ),
            (
                "didfde(3)",
                {
                    "error": "Die class: <didfde> not recognized by parser.",
                    "type": "ParseError",
                },
            ),
            (
                "die(1, 2, 3)",
                {"error": "Too many parameters for class: die", "type": "ParseError"},
            ),
            (
                "die(30000)",
                {
                    "error": "A die of size: 30000 is greater than the allowed max: 500",
                    "type": "LimitsError",
                },
            ),
            (
                "die(-1)",
                {
                    "error": "events may not be empty. a good alternative is the identity - {0: 1}.",
                    "type": "InvalidEventsError",
                },
            ),
            (
                "-2*die(2)",
                {
                    "error": "Tried to add_die or remove_die with a negative number.",
                    "type": "DiceRecordError",
                },
            ),
        ],
    )
    def test_get_response_error_response_all_errors(
        self, handler, instructions, expected
    ):
        response = handler.get_response(instructions)
        assert response == expected
