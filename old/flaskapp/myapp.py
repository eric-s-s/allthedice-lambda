# from dicetables_db import RequestHandler, SQLConnection, MongoDBConnection
import os

from flask import Flask, jsonify, render_template, request

from flaskapp.dice_tables_tequest_handler import DiceTablesRequestHandler

app = Flask(__name__)


@app.route('/_get_table')
def add_numbers():
    reqeust_str = request.args.get('requestStr', '', type=str)
    # handler = RequestHandler(MongoDBConnection('test_app', 'test'))
    # handler = RequestHandler(SQLConnection(':memory:', 'test'))
    handler = DiceTablesRequestHandler(max_dice_value=6000)
    table_obj = handler.get_response(reqeust_str)
    # handler.close_connection()
    if 'error' in table_obj:
        return jsonify(table_obj), 400
    return jsonify(table_obj), 200


@app.route('/')
def index():
    directory = os.path.dirname(__file__)
    instructions_path = os.path.join(directory, 'static', 'instructions.txt')
    with open(instructions_path, 'r') as f:
        instructions_text = f.read()

    intro_path = os.path.join(directory, 'static', 'intro.txt')
    with open(intro_path, 'r') as f:
        intro_text = f.read()
    return render_template('index.html', intro_text=intro_text, instruction_text=instructions_text)


if __name__ == '__main__':
    app.run()
