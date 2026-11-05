import json

from generate_acceptance_test_data import BASIC_CASES, get_basic_cases_file, make_case


def test_basic_cases_file_matches_generated_cases():
    with open(get_basic_cases_file()) as json_file:
        expected = json.load(json_file)

    assert [make_case(case).to_json() for case in BASIC_CASES] == expected
