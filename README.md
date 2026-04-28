# smart-photo-search-aws

## Overview

`smart-photo-search-aws` is a serverless demo application for uploading photos, extracting labels with AI, and searching images using natural language.

The project uses AWS services including:

- Amazon S3 for photo storage
- AWS Lambda for indexing and search operations
- Amazon Rekognition for image label detection
- Amazon Lex for natural language query parsing
- Amazon OpenSearch Service for searchable photo metadata
- Amazon API Gateway for upload and search endpoints

This repo contains the frontend, Lambda handlers, deployment scaffolding, and supporting OpenSearch scripts.

## Architecture

1. User uploads a photo through the frontend or API Gateway.
2. `index-photos` Lambda reads uploaded object metadata, calls Rekognition, normalizes labels, and indexes the record into OpenSearch.
3. User submits a search query through the frontend.
4. `search-photos` Lambda sends the query to Lex for keyword extraction.
5. The Lambda builds an OpenSearch query and returns matching photo results.

## Repository Structure

- `front-end/`
  - `index.html` — browser UI for searching and uploading photos
  - `app.js` — client-side logic for upload and search requests
  - `style.css` — static styling for the demo
  - `sdk-search/` — API Gateway client helper code
- `lambda-functions/`
  - `index-photos/` — S3-triggered indexer Lambda
  - `search-photos/` — query handling Lambda
- `other-scripts/cloudformation/`
  - `template.yaml` — starter deployment template
- `other-scripts/opensearch/`
  - sample OpenSearch mappings, queries, and helper scripts
- `sdk_upload.js` — standalone API Gateway upload client

## Key Features

- Upload photos through a browser UI or direct API calls
- Store uploaded images in Amazon S3
- Use Amazon Rekognition to extract image labels
- Add custom labels with S3 object metadata
- Search photos using natural language queries parsed by Amazon Lex
- Query OpenSearch for matching photo labels and return results

## Frontend

The frontend is a static website in `front-end/`.

- `front-end/index.html` — UI for search and photo upload
- `front-end/app.js` — JavaScript code for `GET /search` and `PUT /photos/{filename}`
- `front-end/style.css` — page styling

> Important: `front-end/app.js` currently contains hardcoded `SEARCH_API`, `SEARCH_API_KEY`, `UPLOAD_API_BASE`, and `UPLOAD_API_KEY` values. Replace these with your own endpoints and keys.

## Lambda Function Details

### `lambda-functions/index-photos/lambda_function.py`

- Triggered by S3 `PUT` events
- Reads S3 object metadata and last modified timestamp
- Calls Rekognition `detect_labels` for image label extraction
- Reads custom labels from `x-amz-meta-customLabels`
- Normalizes label text and singular/plural forms
- Indexes photo documents into OpenSearch using signed IAM requests

### `lambda-functions/search-photos/lambda_function.py`

- Handles `GET /search?q=...` requests
- Uses Amazon Lex Runtime to parse the natural language query
- Extracts search keywords from Lex slots
- Builds an OpenSearch `bool` query with `should` clauses
- Returns matched photo results with S3 URLs and label metadata

## Deployment

This repo includes a starter CloudFormation template at `other-scripts/cloudformation/template.yaml`.

The template provisions:

- A static website S3 bucket for the frontend
- A photo bucket for uploads
- Lambda functions for indexing and search
- API Gateway endpoints for upload and search
- IAM roles and permissions

> Note: The CloudFormation template is a minimal demo scaffold. It does not provision an OpenSearch domain or a full production pipeline by default.

## OpenSearch Support

Use the files in `other-scripts/opensearch/` to configure your OpenSearch index and sample query definitions.

## Configuration

### `lambda-functions/index-photos/lambda_function.py`

Set these environment variables:

- `REGION` — AWS region (default: `us-east-1`)
- `OPENSEARCH_ENDPOINT` — OpenSearch endpoint URL
- `OPENSEARCH_INDEX` — OpenSearch index name, default `photos`

### `lambda-functions/search-photos/lambda_function.py`

Set these environment variables:

- `BOT_ID` — Amazon Lex bot ID
- `BOT_ALIAS_ID` — Amazon Lex bot alias ID
- `OPENSEARCH_HOST` — OpenSearch host name (without `https://`)
- `OPENSEARCH_USERNAME` — OpenSearch username
- `OPENSEARCH_PASSWORD` — OpenSearch password
- `OPENSEARCH_INDEX` — OpenSearch index name, default `photos`

## Getting Started

1. Deploy your AWS resources and create the OpenSearch index.
2. Configure environment variables for both Lambda functions.
3. Update `front-end/app.js` with the correct API endpoints and keys.
4. Host the frontend locally or on S3.
5. Upload photos and search using natural language.

## Notes

- This repository is designed as a proof-of-concept, not a production-ready application.
- Replace or rotate any hardcoded API keys before sharing or deploying publicly.
- The CloudFormation template requires additional security hardening for production.

## Additional Resources

- `front-end/README.md` — placeholder for frontend documentation
- `lambda-functions/README.md` — placeholder for Lambda-specific documentation
- `lambda-functions/search-photos/README.md` — search Lambda implementation notes

---

Maintained for the `smart-photo-search-aws` repository.
