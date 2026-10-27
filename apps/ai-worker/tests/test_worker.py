import pytest
from ai_worker.main import Settings, probe


def test_deterministic_adapter() -> None:
    probe(Settings(adapter="test"))


def test_sqs_requires_queue() -> None:
    with pytest.raises(ValueError):
        probe(Settings(adapter="sqs", queue_url=None))


def test_invalid_adapter() -> None:
    with pytest.raises(ValueError):
        Settings(adapter="unknown")
