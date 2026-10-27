FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir .
USER 10001
CMD ["uvicorn", "ai_service.main:app", "--host", "0.0.0.0", "--port", "8000", "--log-config", "logging.json"]
