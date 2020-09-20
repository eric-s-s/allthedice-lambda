import string
import unittest

from dicetables import (DiceTable, DetailedDiceTable, DiceRecord,
                        ParseError, LimitsError, InvalidEventsError, DiceRecordError,
                        Die, ModDie, WeightedDie, ModWeightedDie, StrongDie, Exploding, ExplodingOn, Modifier,
                        BestOfDicePool, WorstOfDicePool, LowerMidOfDicePool, UpperMidOfDicePool)

from flaskapp.dice_tables_tequest_handler import DiceTablesRequestHandler, make_dict


class TestRequestHandler(unittest.TestCase):
    def setUp(self):
        self.handler = DiceTablesRequestHandler()

    def test_init_default_max_score(self):
        self.assertEqual(self.handler.max_dice_value, 12000)

    def test_init_set_max_dice_value(self):
        handler = DiceTablesRequestHandler(2)
        self.assertEqual(handler.max_dice_value, 2)

    def test_get_table(self):
        self.assertEqual(self.handler.get_table(), DiceTable.new())
        expected = DiceTable.new().add_die(Die(6), 2)
        self.handler.request_dice_table_construction('2*Die(6)')
        self.assertEqual(self.handler.get_table(), expected)

    def test_request_dice_table_empty_string(self):
        self.handler.request_dice_table_construction('')
        self.assertEqual(self.handler.get_table(), DiceTable.new())

    def test_request_dice_table_only_whitespace(self):
        self.handler.request_dice_table_construction('   ')
        self.assertEqual(self.handler.get_table(), DiceTable.new())

    def test_request_dice_table_single_die_no_number(self):
        self.handler.request_dice_table_construction('Die(3)')
        self.assertEqual(self.handler.get_table(), DiceTable.new().add_die(Die(3), 1))

    def test_request_dice_table_single_die_with_number(self):
        self.handler.request_dice_table_construction('2*Die(3)')
        self.assertEqual(self.handler.get_table(), DiceTable.new().add_die(Die(3), 2))

    def test_request_dice_table_multiple_dice_without_number(self):
        self.handler.request_dice_table_construction('Die(3)&Die(2)')
        self.assertEqual(self.handler.get_table(), DiceTable.new().add_die(Die(2)).add_die(Die(3)))

    def test_request_dice_table_multiple_dice_with_number(self):
        self.handler.request_dice_table_construction('2*Die(3) & 2*Die(2)')
        self.assertEqual(self.handler.get_table(), DiceTable.new().add_die(Die(2), 2).add_die(Die(3), 2))

    def test_request_dice_table_construction_request_exceeds_max_dice_value(self):
        handler = DiceTablesRequestHandler(max_dice_value=12)
        handler.request_dice_table_construction('2*Die(6)')
        handler.request_dice_table_construction('6*WeightedDie({1: 2, 2: 10})')
        with self.assertRaises(ValueError) as cm:
            handler.request_dice_table_construction('1*Die(6)&1*Die(7)')
        self.assertEqual(cm.exception.args[0], 'The sum of all max(die_size, len(die_dict))*die_number must be <= 12')

    def test_request_dice_table_construction_exceed_max_dice_value_based_on_max_of_dict_len_and_die_size(self):
        handler = DiceTablesRequestHandler(max_dice_value=12)

        self.assertEqual(len(Exploding(Die(4)).get_dict()), 10)
        handler.request_dice_table_construction('Exploding(Die(4))')
        self.assertEqual(len(Exploding(Die(5)).get_dict()), 13)
        self.assertEqual(Exploding(Die(5)).get_size(), 5)
        self.assertRaises(ValueError, handler.request_dice_table_construction, 'Exploding(Die(5))')

        self.assertEqual(WeightedDie({1: 1, 12: 1}).get_size(), 12)
        handler.request_dice_table_construction('WeightedDie({1: 1, 12: 1})')
        self.assertEqual(len(WeightedDie({1: 1, 13: 1}).get_dict()), 2)
        self.assertEqual(WeightedDie({1: 1, 13: 1}).get_size(), 13)
        self.assertRaises(ValueError, handler.request_dice_table_construction, 'WeightedDie({1: 1, 13: 1})')

    def test_request_dice_table_construction_leading_and_trailing_whitespace(self):
        self.handler.request_dice_table_construction('   2  *  Die( 5 )   &   1  *  Die( 4 )   ')
        self.assertEqual(self.handler.get_table(), DiceTable.new().add_die(Die(5), 2).add_die(Die(4)))

    def test_request_dice_table_construction_all_dice(self):
        all_dice = [Die(die_size=2), ModDie(2, modifier=-1), WeightedDie(dictionary_input={3: 4, 5: 6, 7: 8, 9: 0}),
                    ModWeightedDie({1: 2, 3: 4}, 0), StrongDie(input_die=Die(2), multiplier=2),
                    Exploding(Die(2), explosions=1), ExplodingOn(Die(3), explodes_on=(1, 2)), Modifier(modifier=-100),
                    BestOfDicePool(Die(2), 2, 1), WorstOfDicePool(Die(2), 2, 1), UpperMidOfDicePool(Die(2), 2, 1),
                    LowerMidOfDicePool(Die(2), 2, 1)]

        for die in all_dice:
            self.handler.request_dice_table_construction('2 * {!r}'.format(die))
            self.assertEqual(self.handler.get_table(), DiceTable.new().add_die(die, 2))

    def test_request_dice_table_construction_with_kwargs(self):
        self.handler.request_dice_table_construction('ModDie(die_size=2, modifier=3)')
        self.assertEqual(self.handler.get_table(), DiceTable.new().add_die(ModDie(2, 3)))

    def test_request_dice_table_construction_mixed_case(self):
        request = 'dIe(DiE_sIzE=3)'
        self.handler.request_dice_table_construction(request)
        self.assertEqual(self.handler.get_table(), DiceTable.new().add_die(Die(3)))

    def test_disallowed_delimiters_raise_value_error(self):
        expected_allowed = "!\"#$%&'*+./;<>?@\\^`|~\t\n\r"
        answer = ""
        for char in string.printable:
            try:
                self.handler.request_dice_table_construction('Die(6)', num_delimiter=char)
                answer += char
            except ValueError as e:
                self.assertTrue(e.args[0].startswith('Delimiters may not be'))
        self.assertEqual(expected_allowed, answer)

    def test_request_dice_table_construction_with_all_allowed_delimiters(self):
        allowed = "!\"#$%&'*+./;<>?@\\^`|~\t\n\r"

        for index, num_delimiter in enumerate(allowed):
            pairs_delimiter = allowed[index - 1]
            request_str = f'2{num_delimiter}Die(2){pairs_delimiter}Die(3)'
            expected = DiceTable.new().add_die(Die(2), 2).add_die(Die(3))

            self.handler.request_dice_table_construction(request_str,
                                                         num_delimiter=num_delimiter, pairs_delimiter=pairs_delimiter)
            self.assertEqual(self.handler.get_table(), expected)

    def test_request_dice_table_construction_each_error_raised(self):
        instructions = '2*Die(5) & *Die(4)'
        self.assertRaises(ValueError, self.handler.request_dice_table_construction, instructions)

        instructions = '3 die(3)'
        self.assertRaises(SyntaxError, self.handler.request_dice_table_construction, instructions)

        instructions = '3 * die("a")'
        self.assertRaises(AttributeError, self.handler.request_dice_table_construction, instructions)

        instructions = '3 * moddie(2)'
        self.assertRaises(TypeError, self.handler.request_dice_table_construction, instructions)

        instructions = 'didfde(3)'
        self.assertRaises(ParseError, self.handler.request_dice_table_construction, instructions)

        instructions = 'die(1, 2, 3)'
        self.assertRaises(IndexError, self.handler.request_dice_table_construction, instructions)

        instructions = 'die(30000)'
        self.assertRaises(LimitsError, self.handler.request_dice_table_construction, instructions)

        instructions = 'die(-1)'
        self.assertRaises(InvalidEventsError, self.handler.request_dice_table_construction, instructions)

        instructions = '-2*die(2)'
        self.assertRaises(DiceRecordError, self.handler.request_dice_table_construction, instructions)

    def test_request_dice_table_construction_all_errors_are_caught(self):
        errors = (ValueError, SyntaxError, AttributeError, IndexError, TypeError,
                  ParseError, LimitsError, InvalidEventsError, DiceRecordError)
        instructions = ['* Die(4)', '3 die(3)', '3 & die(3)', 'Die(4) * 3 * Die(5)', '4 $ die(5)',
                        '2 * die(5) $ 4 * die(6)', 'die("a")', 'die(5', 'die(5000)', 'notadie(5)',
                        'die(1, 2, 3)', 'WeightedDie({1, 2})', 'WeightedDie({-1: 1})', 'Die(-1)',
                        'WeightedDie({1: -1})', '-2*Die(2)', 'ModDie(2)']
        for instruction in instructions:
            self.assertRaises(errors, self.handler.request_dice_table_construction, instruction)

    def test_make_dict_simple_table(self):
        answer = make_dict(DiceTable.new().add_die(Die(4)))
        expected = {
            'name': '<DiceTable containing [1D4]>',
            'diceStr': 'Die(4): 1',
            'data': {'x': (1, 2, 3, 4), 'y': (25.0, 25.0, 25.0, 25.0)},
            'tableString': '1: 1\n2: 1\n3: 1\n4: 1\n',
            'forSciNum': [
                {'roll': 1, 'mantissa': '1.00000', 'exponent': '0'},
                {'roll': 2, 'mantissa': '1.00000', 'exponent': '0'},
                {'roll': 3, 'mantissa': '1.00000', 'exponent': '0'},
                {'roll': 4, 'mantissa': '1.00000', 'exponent': '0'}
            ],
            'range': (1, 4),
            'mean': 2.5,
            'stddev': 1.118,
            'roller': {
                'height': "4",
                'aliases': [
                    {'primary': "4", 'alternate': "4", 'primaryHeight': "4"},
                    {'primary': "3", 'alternate': "3", 'primaryHeight': "4"},
                    {'primary': "2", 'alternate': "2", 'primaryHeight': "4"},
                    {'primary': "1", 'alternate': "1", 'primaryHeight': "4"}
                ]
            }
        }

        self.assertEqual(answer, expected)

    def test_make_dict_large_number_table(self):
        table = DiceTable({1: 1, 2: 9 ** 351}, DiceRecord.new())
        answer = make_dict(table)
        expected = {
            'data': {'x': (1, 2), 'y': (0.0, 100.0)},
            'forSciNum': [
                {'roll': 1, 'mantissa': '1.00000', 'exponent': '0'},
                {'roll': 2, 'mantissa': '8.69202', 'exponent': '334'}
            ],
            'mean': 2.0,
            'range': (1, 2),
            'name': '<DiceTable containing []>',
            'diceStr': '',
            'stddev': 0.0,
            'tableString': '1: 1\n2: 8.692e+334\n',
            'roller': {
                'height': ('8692021926532582239431197828370635593634075173099158789854434049807997760319275071636088'
                           '5895145922991572345585185250800940116508114750525076655926616148114182143549026229853337'
                           '9940869208919850517403157109776051593152797345404989883632793071982398710942373198113120'
                           '40403122389178667907944352945294284623021821750094845717881664249886010'),
                'aliases': [
                    {'primary': "1", "alternate": "2", "primaryHeight": "2"},
                    {"primary": "2", "alternate": "2",
                     "primaryHeight": ("8692021926532582239431197828370635593634075173099158789854434049807997760319"
                                       "2750716360885895145922991572345585185250800940116508114750525076655926616148"
                                       "1141821435490262298533379940869208919850517403157109776051593152797345404989"
                                       "8836327930719823987109423731981131204040312238917866790794435294529428462302"
                                       "1821750094845717881664249886010")}

                ]
            }
        }

        self.assertEqual(answer, expected)

    def test_make_dict_complex_table(self):
        table = DiceTable.new().add_die(WeightedDie({1: 1, 2: 99}), 3).add_die(Die(3), 4)
        answer = make_dict(table)
        expected = {
            'name': '<DiceTable containing [3D2  W:100, 4D3]>',
            'diceStr': 'WeightedDie({1: 1, 2: 99}): 3\nDie(3): 4',
            'data': {
                'x': (7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18),
                'y': (1.234567901234568e-06, 0.0003716049382716049, 0.03777901234567901, 1.3467864197530863,
                      5.16049012345679, 12.566786419753084, 19.861979012345678, 23.34457160493827, 19.53086790123457,
                      12.124566666666665, 4.8279, 1.1978999999999997)
            },
            'tableString': (' 7: 1\n' +
                            ' 8: 301\n' +
                            ' 9: 30,601\n' +
                            '10: 1,090,897\n' +
                            '11: 4,179,997\n' +
                            '12: 1.018e+7\n' +
                            '13: 1.609e+7\n' +
                            '14: 1.891e+7\n' +
                            '15: 1.582e+7\n' +
                            '16: 9,820,899\n' +
                            '17: 3,910,599\n' +
                            '18: 970,299\n'),
            'forSciNum': [
                {'roll': 7, 'mantissa': '1.00000', 'exponent': '0'},
                {'roll': 8, 'mantissa': '3.01000', 'exponent': '2'},
                {'roll': 9, 'mantissa': '3.06010', 'exponent': '4'},
                {'roll': 10, 'mantissa': '1.09090', 'exponent': '6'},
                {'roll': 11, 'mantissa': '4.18000', 'exponent': '6'},
                {'roll': 12, 'mantissa': '1.01791', 'exponent': '7'},
                {'roll': 13, 'mantissa': '1.60882', 'exponent': '7'},
                {'roll': 14, 'mantissa': '1.89091', 'exponent': '7'},
                {'roll': 15, 'mantissa': '1.58200', 'exponent': '7'},
                {'roll': 16, 'mantissa': '9.82090', 'exponent': '6'},
                {'roll': 17, 'mantissa': '3.91060', 'exponent': '6'},
                {'roll': 18, 'mantissa': '9.70299', 'exponent': '5'}
            ],
            'range': (7, 18),
            'mean': 13.97,
            'stddev': 1.642,
            'roller': {
                'aliases': [{
                    'alternate': '16', 'primary': '18', 'primaryHeight': '11643588'},
                    {'alternate': '15', 'primary': '16', 'primaryHeight': '48494376'},
                    {'alternate': '15', 'primary': '17', 'primaryHeight': '46927188'},
                    {'alternate': '15', 'primary': '11', 'primaryHeight': '50159964'},
                    {'alternate': '15', 'primary': '10', 'primaryHeight': '13090764'},
                    {'alternate': '14', 'primary': '15', 'primaryHeight': '24512328'},
                    {'alternate': '14', 'primary': '9', 'primaryHeight': '367212'},
                    {'alternate': '14', 'primary': '8', 'primaryHeight': '3612'},
                    {'alternate': '13', 'primary': '14', 'primaryHeight': '8792388'},
                    {'alternate': '13', 'primary': '7', 'primaryHeight': '12'},
                    {'alternate': '12', 'primary': '13', 'primaryHeight': '39850836'},
                    {'alternate': '12', 'primary': '12', 'primaryHeight': '81000000'}
                ],
                'height': '81000000',
            },
        }

        self.assertEqual(answer, expected)

    def test_make_dict_mean_and_stddev_rounding(self):
        table = DetailedDiceTable.new().add_die(WeightedDie({1: 1, 2: 2}))
        answer = make_dict(table)
        self.assertEqual(table.calc.mean(), 1.6666666666666667)
        self.assertEqual(answer['mean'], 1.667)

        self.assertEqual(table.calc.stddev(3), 0.471)
        self.assertEqual(answer['stddev'], 0.471)

    def test_make_dict_can_handle_gaps(self):
        table = DiceTable.new().add_die(WeightedDie({1: 1, 3: 1}))
        answer = make_dict(table)
        expected = {
            'name': '<DiceTable containing [1D3  W:2]>',
            'diceStr': 'WeightedDie({1: 1, 2: 0, 3: 1}): 1',
            'data': {'x': (1, 2, 3), 'y': (50.0, 0.0, 50.0)},
            'tableString': '1: 1\n2: 0\n3: 1\n',
            'forSciNum': [
                {'roll': 1, 'mantissa': '1.00000', 'exponent': '0'},
                {'roll': 2, 'mantissa': '0', 'exponent': '0'},
                {'roll': 3, 'mantissa': '1.00000', 'exponent': '0'}
            ],
            'range': (1, 3),
            'mean': 2,
            'stddev': 1.0,
            'roller': {
                'height': "2",
                'aliases': [
                    {'primary': "3", 'alternate': "3", 'primaryHeight': "2"},
                    {'primary': "1", 'alternate': "1", 'primaryHeight': "2"}
                ]
            }
        }
        self.assertEqual(answer, expected)

    def test_get_response_empty_string_and_whitespace(self):
        empty_str_answer = self.handler.get_response('')

        empty_response = {
            'data': {'x': (0,), 'y': (100.0,)},
            'forSciNum': [{'roll': 0, 'mantissa': '1.00000', 'exponent': '0'}],
            'mean': 0.0,
            'range': (0, 0),
            'name': '<DiceTable containing []>',
            'diceStr': '',
            'stddev': 0.0,
            'tableString': '0: 1\n',
            'roller': {
                'aliases': [
                    {'alternate': '0',
                     'primary': '0',
                     'primaryHeight': '1'}
                ],
                'height': '1',
            }
        }
        self.assertEqual(empty_str_answer, empty_response)

        whitespace_str_answer = self.handler.get_response('   ')
        self.assertEqual(whitespace_str_answer, empty_response)

    def test_get_response(self):
        response = self.handler.get_response('Die(2)')
        expected = {
            'diceStr': 'Die(2): 1',
            'name': '<DiceTable containing [1D2]>',
            'data': {'x': (1, 2), 'y': (50.0, 50.0)},
            'tableString': '1: 1\n2: 1\n',
            'forSciNum': [
                {'roll': 1, 'mantissa': '1.00000', 'exponent': '0'},
                {'roll': 2, 'mantissa': '1.00000', 'exponent': '0'}
            ],
            'range': (1, 2), 'mean': 1.5, 'stddev': 0.5,
            'roller': {
                'aliases': [
                    {'alternate': '2', 'primary': '2', 'primaryHeight': '2'},
                    {'alternate': '1', 'primary': '1', 'primaryHeight': '2'}],
                'height': '2',
            },
        }
        self.assertEqual(response, expected)

    def test_get_response_error_response_all_errors(self):
        instructions = '2*Die(5) & *Die(4)'
        response = self.handler.get_response(instructions)
        self.assertEqual(response,
                         {"error": "invalid literal for int() with base 10: ' '", "type": "ValueError"})

        instructions = '3 die(3)'
        response = self.handler.get_response(instructions)
        self.assertEqual(response,
                         {'error': 'invalid syntax', 'type': 'SyntaxError'})

        instructions = '3 * die("a")'
        response = self.handler.get_response(instructions)
        self.assertEqual(response,
                         {'error': "'Str' object has no attribute 'n'", 'type': 'AttributeError'})

        instructions = '3 * moddie(1)'
        response = self.handler.get_response(instructions)
        self.assertEqual(response,
                         {'error': "__init__() missing 1 required positional argument: 'modifier'",
                          'type': 'TypeError'})

        instructions = 'didfde(3)'
        response = self.handler.get_response(instructions)
        self.assertEqual(response,
                         {'error': 'Die class: <didfde> not recognized by parser.', 'type': 'ParseError'})

        instructions = 'die(1, 2, 3)'
        response = self.handler.get_response(instructions)
        self.assertEqual(response,
                         {'error': 'tuple index out of range', 'type': 'IndexError'})

        instructions = 'die(30000)'
        response = self.handler.get_response(instructions)
        self.assertEqual(response,
                         {'error': 'Max die_size: 500', 'type': 'LimitsError'})

        instructions = 'die(-1)'
        response = self.handler.get_response(instructions)
        self.assertEqual(response,
                         {'error': 'events may not be empty. a good alternative is the identity - {0: 1}.',
                          'type': 'InvalidEventsError'})

        instructions = '-2*die(2)'
        response = self.handler.get_response(instructions)
        self.assertEqual(response,
                         {'error': 'Tried to add_die or remove_die with a negative number.', 'type': 'DiceRecordError'})
