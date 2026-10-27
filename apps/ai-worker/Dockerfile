FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir .
USER 10001
CMD ["python", "-m", "ai_worker.main"]
