FROM python:3.14.7-alpine3.24

# Desativa o Python de escrever arquivos como .pyc
ENV PYTHONDONTWRITEBYTECODE 1
# Impede o Python de gerar um buffer para instruções não realizadas
ENV PYTHONUNBUFFERED 1

# Instala o pacote do postgree
RUN apk add --no-cache postgresql-client

# Cria um usuário com permissões
RUN adduser --disabled-password --no-create-home dev

WORKDIR /backend
RUN python -m venv /venv && \
    /venv/bin/pip install --upgrade pip

COPY requirements.txt /backend/
RUN /venv/bin/pip install -r requirements.txt
COPY --chown=dev:dev ./ /backend

ENV PATH="/venv/bin:$PATH"

USER dev

# Expõe a porta 8000 para o container do Django
EXPOSE 8000