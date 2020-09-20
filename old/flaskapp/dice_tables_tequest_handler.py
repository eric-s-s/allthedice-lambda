import string

from dicetables import (Parser, DiceTable, DiceRecord, EventsCalculations,
                        ParseError, LimitsError, InvalidEventsError, DiceRecordError, Roller)
from dicetables.tools.alias_table import Alias


class DiceTablesRequestHandler(object):
    def __init__(self, max_dice_value=12000) -> None:
        self._table = DiceTable.new()
        self._parser = Parser(ignore_case=True)
        self._max_dice_value = max_dice_value

    @property
    def max_dice_value(self):
        return self._max_dice_value

    def request_dice_table_construction(self, instructions: str, num_delimiter='*', pairs_delimiter='&') -> None:

        self._raise_error_for_bad_delimiter(num_delimiter, pairs_delimiter)

        record = DiceRecord.new()

        if instructions.strip() == '':
            number_die_pairs = []
        else:
            number_die_pairs = instructions.split(pairs_delimiter)

        for pair in number_die_pairs:
            if num_delimiter not in pair:
                number = 1
                die = pair
            else:
                num, die = pair.split(num_delimiter)
                number = int(num)
            die = self._parser.parse_die_within_limits(die)
            record = record.add_die(die, number)

        self._check_record_against_max_dice_value(record)

        self._make_table(record)

    def _make_table(self, record: DiceRecord):
        table = DiceTable.new()
        for die, num in record.get_dict().items():
            table = table.add_die(die, num)
        self._table = table

    @staticmethod
    def _raise_error_for_bad_delimiter(num_delimiter, pairs_delimiter):
        reserved_characters = '_[]{}(),: -=\x0b\x0c' + string.digits + string.ascii_letters
        if num_delimiter in reserved_characters or pairs_delimiter in reserved_characters:
            raise ValueError('Delimiters may not be {!r}'.format(reserved_characters))

    def _check_record_against_max_dice_value(self, record):
        if sum(
                (max(len(die.get_dict()), die.get_size()) * number) for die, number in record.get_dict().items()
        ) > self._max_dice_value:
            raise ValueError('The sum of all max(die_size, len(die_dict))*die_number must be <= {}'
                             .format(self._max_dice_value))

    def get_table(self):
        return self._table

    def get_response(self, input_str):
        errors = (ValueError, SyntaxError, AttributeError, IndexError, TypeError,
                  ParseError, LimitsError, InvalidEventsError, DiceRecordError)

        try:
            self.request_dice_table_construction(input_str)
            return make_dict(self._table)
        except errors as e:
            return {'error': e.args[0], 'type': e.__class__.__name__}



def make_dict(dice_table: DiceTable):
    calc = EventsCalculations(dice_table)
    out = dict()
    out['diceStr'] = '\n'.join(['{!r}: {}'.format(die, number) for die, number in dice_table.get_list()])
    out['name'] = repr(dice_table)

    x_axis, y_axis = calc.percentage_axes()
    out['data'] = {'x': x_axis, 'y': y_axis}
    out['tableString'] = calc.full_table_string()

    lines = calc.full_table_string(6, -1).split('\n')
    for_scinum = [_get_json(el) for el in lines if el]

    out['forSciNum'] = for_scinum

    out['range'] = calc.info.events_range()
    out['mean'] = round(calc.mean(), 3)
    out['stddev'] = calc.stddev(3)

    out['roller'] = _get_roller_data(dice_table)
    return out


def _get_json(full_table_str_line):
    roll, number = full_table_str_line.split(': ')
    if number == '0':
        mantissa = exponent = '0'
    else:
        mantissa, exponent = number.split('e+')
    return {'roll': int(roll), 'mantissa': mantissa, 'exponent': exponent}


def _get_roller_data(dice_table: DiceTable):
    roller = Roller(dice_table)
    return {
        'height': str(roller.alias_table.height),
        'aliases': [_get_alias_dict(alias) for alias in roller.alias_table.to_list()]
    }


def _get_alias_dict(alias: Alias):
    return {
        'primary': str(alias.primary),
        'alternate': str(alias.alternate),
        'primaryHeight': str(alias.primary_height)
    }
