# Flask ML API Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY api/requirements_api.txt .
RUN pip install --no-cache-dir -r requirements_api.txt

# Copy models and api code
COPY models/ /app/models/
COPY api/ /app/api/

WORKDIR /app/api

# Set model directory for production
ENV MODEL_DIR=/app/models

# Expose Flask port
EXPOSE 5000

# Run with gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "api_server:app"]
