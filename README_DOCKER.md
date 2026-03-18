# Docker Setup for SCI Recurso

Este guia explica como configurar e executar o projeto SCI Recurso usando Docker.

## Arquivos Docker Criados

- `Dockerfile` - Para o backend (Node.js + Express)
- `Dockerfile.frontend` - Para o frontend (React + Vite + Nginx)
- `docker-compose.yml` - Configuração para desenvolvimento (banco externo)
- `docker-compose.prod.yml` - Configuração para produção (banco externo)
- `nginx.conf` - Configuração do Nginx para o frontend
- `.dockerignore` - Arquivos a serem ignorados no build

## Pré-requisitos

- Docker instalado
- Docker Compose instalado
- Banco de dados MySQL já rodando em container separado

## Configuração do Banco de Dados

O projeto assume que você já tem um container MySQL rodando separadamente. Seu container deve estar acessível em `localhost:3306` com as seguintes credenciais:

- Database: `sci_recurso`
- User: `root`
- Password: `Gabinete@193`

Se precisar criar o banco, use este docker-compose:

```yaml
version: '3.8'

services:
  mysql-db:
    image: mysql:8.0
    container_name: mysql-sci-recurso
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: Gabinete@193
      MYSQL_DATABASE: sci_recurso
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

## Variáveis de Ambiente

Opcionalmente, crie um arquivo `.env` para produção:

```env
# Banco de Dados
DB_NAME=sci_recurso
DB_USER=root
DB_PASSWORD=Gabinete@193

# API
GEMINI_API_KEY=sua_chave_gemini
```

## Executando o Projeto

### Para Desenvolvimento

```bash
# Construir e iniciar todos os serviços
docker-compose up --build

# Em segundo plano
docker-compose up -d --build

# Parar os serviços
docker-compose down

# Ver logs
docker-compose logs -f
```

### Para Produção

```bash
# Construir e iniciar para produção
docker-compose -f docker-compose.prod.yml up --build -d

# Parar serviços de produção
docker-compose -f docker-compose.prod.yml down
```

## Acesso à Aplicação

Após iniciar os contêineres:

- **Frontend (Desenvolvimento)**: http://localhost:5173
- **Frontend (Produção)**: http://localhost:80
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## Serviços

### API Backend
- Porta: 3001
- Conexão com MySQL externo via `host.docker.internal`
- Health check configurado
- Logs em volume compartilhado

### Frontend
- Porta 5173 (desenvolvimento) ou 80 (produção)
- Servido por Nginx
- Build otimizado para produção

## Comandos Úteis

```bash
# Ver status dos contêineres
docker-compose ps

# Executar comandos no contêiner
docker-compose exec api sh

# Reconstruir imagem específica
docker-compose build api
docker-compose build frontend

# Limpar tudo (imagens, contêineres)
docker-compose down --rmi all
```

## Troubleshooting

### Problemas Comuns

1. **Conexão com banco**: Verifique se o MySQL está rodando e acessível
2. **Portas já em uso**: Altere as portas no docker-compose.yml
3. **Permissões**: Verifique se o Docker tem permissões necessárias
4. **host.docker.internal**: No Linux, pode precisar de configuração adicional

### Verificar Conexão com Banco

```bash
# Testar conexão do contêiner com o banco
docker-compose exec api node -e "
const mysql = require('mysql2');
const conn = mysql.createConnection({
  host: 'host.docker.internal',
  user: 'root',
  password: 'Gabinete@193',
  database: 'sci_recurso'
});
conn.connect(err => {
  if(err) console.log('Erro:', err);
  else console.log('Conectado com sucesso!');
  conn.end();
});
"
```

### Logs

```bash
# Logs de todos os serviços
docker-compose logs

# Logs de serviço específico
docker-compose logs api
docker-compose logs frontend
```

## Backup e Restore

O backup e restore devem ser feitos diretamente no container MySQL externo:

```bash
# Backup (execute no host)
docker exec mysql-sci-recurso mysqldump -u root -pGabinete@193 sci_recurso > backup.sql

# Restore (execute no host)
docker exec -i mysql-sci-recurso mysql -u root -pGabinete@193 sci_recurso < backup.sql
```

## Monitoramento

Os contêineres possuem health checks configurados. Para verificar:

```bash
docker-compose ps
```

Status esperado: `healthy` para todos os serviços.
