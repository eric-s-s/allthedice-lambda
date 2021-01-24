import json
from unittest.mock import patch

from lambda_function import lambda_handler


def make_response_for_tests(body: dict, status: int):
    return {
        "body": json.dumps(body),
        "headers": {"Content-Type": "application/json"},
        "statusCode": status,
    }


def test_bad_request():
    event = {"body": {"a": "b"}}
    response = lambda_handler(event, None)

    expected_status = 400
    expected_body = {"message": "could not process"}
    assert response == make_response_for_tests(expected_body, expected_status)


def test_bad_request_logs_exception():
    event = {"body": {"a": "b"}}
    with patch("lambda_function.logger") as mock_logger:
        lambda_handler(event, None)

    mock_logger.exception.assert_called_once()

    call_args = mock_logger.exception.call_args
    assert isinstance(call_args[0][0], KeyError)


def test_bad_build_string_request():
    event = {"body": {"buildString": "Die(1, 2)"}}
    response = lambda_handler(event, None)

    expected_status = 404
    expected_body = {
        "error": "Too many parameters for class: Die",
        "type": "ParseError",
    }
    assert response == make_response_for_tests(expected_body, expected_status)


def test_good_build_string_request():
    event = {"body": {"buildString": "Die(1)"}}
    response = lambda_handler(event, None)

    expected_status = 200
    expected_body = {
        "diceStr": "Die(1): 1",
        "name": "<DiceTable containing [1D1]>",
        "data": {"x": [1], "y": [100.0]},
        "tableString": "1: 1\n",
        "forSciNum": [{"roll": 1, "mantissa": "1.00000", "exponent": "0"}],
        "range": [1, 1],
        "mean": 1.0,
        "stddev": 0.0,
        "roller": {
            "height": "1",
            "aliases": [{"primary": "1", "alternate": "1", "primaryHeight": "1"}],
        },
    }
    assert response == make_response_for_tests(expected_body, expected_status)
