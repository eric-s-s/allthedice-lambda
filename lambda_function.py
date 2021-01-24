from request_handler.dice_tables_tequest_handler import DiceTablesRequestHandler

HANDLER = DiceTablesRequestHandler(max_dice_value=6000)


def lambda_handler(event: dict, context):
    base_response = HANDLER.get_response(event["body"]["buildString"])
    status = 200
    if 'error' in base_response:
        status = 400
    return {'statusCode': status, 'body': base_response}
