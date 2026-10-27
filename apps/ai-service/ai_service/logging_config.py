import json
import logging


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        return json.dumps(
            {
                "service": "ai-service",
                "level": record.levelname,
                "message": record.getMessage(),
            }
        )
