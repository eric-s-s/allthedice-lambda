.PHONY: run-dev-server

run-dev-server:
	uv run --no-project --with dicetables python dev_server.py

test:
	uv run --no-project --with dicetables --with pytest pytest
