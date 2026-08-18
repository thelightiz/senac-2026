#!/bin/bash
# Script para criar a estrutura de pastas do SimulaCoop
# Como usar: abra o terminal do VSCode na pasta onde quer criar o projeto e rode:
#   bash criar-estrutura-simulacoop.sh

set -e

mkdir -p simulacoop/backend/app/routes
mkdir -p simulacoop/backend/app/services
mkdir -p simulacoop/backend/app/models
mkdir -p simulacoop/backend/app/schemas
mkdir -p simulacoop/backend/tests
mkdir -p simulacoop/frontend/src/components
mkdir -p simulacoop/frontend/src/pages
mkdir -p simulacoop/frontend/src/services
mkdir -p simulacoop/frontend/src/styles
mkdir -p simulacoop/docs

touch simulacoop/backend/app/routes/loan_routes.py
touch simulacoop/backend/app/services/loan_calculation_service.py
touch simulacoop/backend/app/models/loan.py
touch simulacoop/backend/app/schemas/loan_schema.py
touch simulacoop/backend/app/main.py
touch simulacoop/backend/app/__init__.py
touch simulacoop/backend/requirements.txt
touch simulacoop/backend/tests/__init__.py
touch simulacoop/frontend/src/services/api.js
touch simulacoop/docs/requisitos.md
touch simulacoop/README.md

echo "Estrutura do SimulaCoop criada com sucesso dentro da pasta 'simulacoop/'."
