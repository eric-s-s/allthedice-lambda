import json
from dataclasses import dataclass
from enum import Enum
from logging import getLogger

from request_handler.dice_tables_tequest_handler import DiceTablesRequestHandler

HANDLER = DiceTablesRequestHandler(max_dice_value=6000)

logger = getLogger(__name__)


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
            "headers": {
                "Content-Type": "application/json"
            }
        }


def lambda_handler(event: dict, context):
    try:
        body = event["body"]
        if not isinstance(body, dict):
            body = json.loads(body)
        base_response = HANDLER.get_response(body["buildString"])
        status = Status.OK
        if "error" in base_response:
            status = Status.NOT_FOUND
        return Response(status, base_response).to_json()
    except Exception as e:
        logger.exception(e)
        return Response(Status.BAD_REQUEST, {"message": "could not process"}).to_json()
