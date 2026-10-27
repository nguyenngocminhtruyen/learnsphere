"""Phase 0 queue connectivity probe. No domain jobs are executed or acknowledged."""

import json
import logging
import signal
from threading import Event
from typing import Literal

import boto3
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="WORKER_")
    adapter: Literal["test", "sqs"] = "test"
    region: str = "us-east-1"
    endpoint_url: str | None = None
    queue_url: str | None = None


def probe(settings: Settings) -> None:
    if settings.adapter == "sqs":
        if not settings.queue_url:
            raise ValueError("WORKER_QUEUE_URL is required for sqs")
        client = boto3.client(
            "sqs", region_name=settings.region, endpoint_url=settings.endpoint_url
        )
        client.get_queue_attributes(QueueUrl=settings.queue_url, AttributeNames=["QueueArn"])


def main() -> None:
    settings = Settings()
    stop = Event()
    signal.signal(signal.SIGTERM, lambda *_: stop.set())
    signal.signal(signal.SIGINT, lambda *_: stop.set())
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    while not stop.is_set():
        probe(settings)
        logging.info(
            json.dumps({"service": "ai-worker", "event": "heartbeat", "adapter": settings.adapter})
        )
        stop.wait(10)


if __name__ == "__main__":
    main()
