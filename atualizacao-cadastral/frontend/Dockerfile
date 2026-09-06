FROM node:26-alpine3.23

WORKDIR /frontend

# Copia os arquivos de dependência
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o resto
COPY . .