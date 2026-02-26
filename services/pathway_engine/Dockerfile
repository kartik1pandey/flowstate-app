FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for Pathway
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create necessary directories for Pathway streaming
RUN mkdir -p /app/input_stream /app/output /app/sessions_stream /app/rag_index /app/interventions

# Copy application code
COPY . .

# Expose FastAPI port
EXPOSE 8001

# Run the application
CMD ["python", "main.py"]
