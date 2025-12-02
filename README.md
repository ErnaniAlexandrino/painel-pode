# Dashboard Eleições 2026 - PWA

Um Progressive Web App (PWA) desenvolvido em React para monitoramento de eleições, baseado no design da imagem fornecida.

## 🚀 Funcionalidades

- **Dashboard Responsivo**: Interface adaptável para desktop e mobile
- **Métricas Eleitorais**: Cards com informações sobre votação, chapas vencedoras e composição eleitoral
- **Tabela de Candidatos**: Lista completa com dados dos candidatos, projeções e histórico
- **Projeções**: Cards com projeções de cadeiras e votos
- **Líderes Não Eleitos**: Tabelas com informações dos principais líderes
- **PWA**: Funciona offline e pode ser instalado como app

## 🛠️ Tecnologias Utilizadas

- React 18
- CSS3 com Grid e Flexbox
- Service Worker para cache offline
- Manifest.json para instalação PWA

## 📱 Como Instalar

### 🐳 Com Docker (Recomendado)

**Windows:**
```bash
docker-run.bat
```

**Linux/Mac:**
```bash
chmod +x docker-run.sh
./docker-run.sh
```

**Ou manualmente:**
```bash
docker-compose up --build
```

### 📦 Instalação Tradicional

1. Clone o repositório
2. Execute `npm install`
3. Execute `npm start`
4. Acesse `http://localhost:3000`

## 🔧 Scripts Disponíveis

- `npm start`: Inicia o servidor de desenvolvimento
- `npm build`: Cria build de produção
- `npm test`: Executa os testes
- `npm eject`: Ejecta do Create React App

## 📊 Componentes

- **Sidebar**: Navegação lateral com informações do estado
- **Header**: Barra superior com informações do usuário
- **MetricsCards**: Cards com métricas eleitorais
- **CandidatesTable**: Tabela principal de candidatos
- **ProjectionCards**: Cards de projeções
- **LeadersSection**: Seção de líderes não eleitos

## 🎨 Design

O design foi baseado na imagem fornecida, replicando:
- Layout em duas colunas (sidebar + conteúdo)
- Cards coloridos com bordas laterais
- Tabelas responsivas
- Cores: azul, verde e roxo para categorização
- Tipografia clara e legível

## 📱 PWA Features

- **Manifest**: Configurado para instalação
- **Service Worker**: Cache offline
- **Responsive**: Adaptável a diferentes tamanhos de tela
- **Instalável**: Pode ser adicionado à tela inicial

## 🔄 Atualizações

O PWA suporta atualizações automáticas através do Service Worker, garantindo que os usuários sempre tenham a versão mais recente.
