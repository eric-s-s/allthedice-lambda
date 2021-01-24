BASE="${1:-venv}"

DICETABLES="${BASE}/lib/python3.7/site-packages/dicetables"

LIBRARY="request_handler"

LAMBDA="lambda_function.py"


zip -r mypkg.zip "${DICETABLES}"
zip -ur mypkg.zip "${LIBRARY}"
zip -u mypkg.zip "${LAMBDA}"
