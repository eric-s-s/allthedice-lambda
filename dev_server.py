"""Run the lambda as a local HTTP server.

    venv/bin/python dev_server.py [--port 8000]
    uv run --no-project --with dicetables python dev_server.py

POST {"buildString": "..."} to http://localhost:8000/_construct. Each request is
wrapped in an API Gateway style event and passed to lambda_handler, and its
statusCode, headers and body are returned as the HTTP response.

Cross-origin requests from any origin are allowed.
"""

import argparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

from lambda_function import lambda_handler


class LambdaRequestHandler(BaseHTTPRequestHandler):
    @staticmethod
    def _get_allowed_post_path():
        return "/_construct"

    def do_OPTIONS(self):
        if not self.is_correct_post_path():
            self.send_error(404)
            return
        self.send_response(204)
        self.send_cors_headers()
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        if not self.is_correct_post_path():
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode("utf-8")
        response = lambda_handler({"body": body, "isBase64Encoded": False}, None)

        payload = response["body"].encode("utf-8")
        self.send_response(response["statusCode"])
        for name, value in response["headers"].items():
            self.send_header(name, value)
        self.send_header("Content-Length", str(len(payload)))
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(payload)

    def is_correct_post_path(self):
        return urlparse(self.path).path == self._get_allowed_post_path()

    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()

    server = ThreadingHTTPServer(("127.0.0.1", args.port), LambdaRequestHandler)
    print(
        f"lambda at http://localhost:{args.port}{LambdaRequestHandler._get_allowed_post_path()}  (ctrl-c to stop)"
    )
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
