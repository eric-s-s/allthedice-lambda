from base64 import b64decode
import json
from dataclasses import dataclass
from enum import Enum
from logging import getLogger, INFO

from request_handler.dice_tables_tequest_handler import DiceTablesRequestHandler

HANDLER = DiceTablesRequestHandler(max_dice_value=4000)

logger = getLogger(__name__)
logger.setLevel(INFO)


class Status(Enum):
    OK = 200
    BAD_REQUEST = 400
    NOT_FOUND = 404
    FORBIDDEN = 403


@dataclass
class Response:
    status: Status
    body: dict

    def to_json(self):
        return {
            "body": json.dumps(self.body),
            "statusCode": self.status.value,
            "headers": {"Content-Type": "application/json"},
        }


def lambda_handler(event: dict, context):
    try:
        body = event["body"]
        if event["isBase64Encoded"]:
            body = b64decode(body)
        if not isinstance(body, dict):
            body = json.loads(body)
        logger.info(f"request: {body}")
        base_response = HANDLER.get_response(body["buildString"])
        status = Status.OK
        if "errorMessage" in base_response:
            status = Status.NOT_FOUND
        response = Response(status, base_response).to_json()
        logger.info(f"response: {response}"[:200])
        return response
    except Exception as e:
        logger.exception(e)
        logger.error(event)
        return Response(Status.BAD_REQUEST, {"errorMessage": "could not process"}).to_json()
