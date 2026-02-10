# 🎯 Arduino Kit Manager - Sistema Completo

Sistema profissional de gerenciamento de kits Arduino com autenticação, rastreamento de componentes, análise de IA e geração automática de QR Codes.

![Arduino Kit Manager](https://img.shields.io/badge/Python-3.8+-blue)
![Flask](https://img.shields.io/badge/Flask-3.0-green)
![License](https://img.shields.io/badge/license-MIT-orange)

## 🌟 Funcionalidades Principais

### 🔐 Sistema de Autenticação Completo
- ✅ **Cadastro de usuários** com validação
- ✅ **Login seguro** com senha criptografada
- ✅ **Recuperação de senha** com token
- ✅ **Gerador de senhas fortes** com sugestões
- ✅ **Visualização de senha** (toggle)
- ✅ **Sessão persistente** com logout

### 📦 Gerenciamento de Kits
- ✅ **Cadastrar kits** com componentes personalizados
- ✅ **QR Code automático** para cada kit
- ✅ **Scanner de QR Code** para acesso rápido
- ✅ **Quadro Kanban** (Em Uso / Para Conferência / Organizado)
- ✅ **Rastreamento de componentes** com quantidades
- ✅ **Histórico completo** de movimentações
- ✅ **Deletar kits** com confirmação

### 🤖 Análise Inteligente
- ✅ **IA para componentes perdidos** com frequência
- ✅ **Recomendações automáticas** de reposição
- ✅ **Estatísticas em tempo real**

### 🎨 Interface Moderna
- ✅ **Modo Escuro/Claro** com toggle
- ✅ **Design responsivo** mobile-first
- ✅ **Animações suaves**
- ✅ **Informações do usuário** no header

## 🚀 Instalação Rápida

### 1️⃣ Requisitos
- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)

### 2️⃣ Instalar Dependências

```bash
pip install -r requirements.txt
```

### 3️⃣ Executar o Sistema

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Ou manualmente:**
```bash
python app.py
```

### 4️⃣ Acessar o Sistema

Abra seu navegador em:
```
http://localhost:5000
```

## 👤 Primeiro Acesso

1. **Criar conta:**
   - Acesse `http://localhost:5000`
   - Será redirecionado para a tela de login
   - Clique em "Cadastre-se"
   - Preencha nome, email e senha
   - Use o gerador de senhas fortes se desejar

2. **Fazer login:**
   - Digite email e senha cadastrados
   - Marque "Lembrar-me" para sessão persistente

3. **Recuperar senha (se necessário):**
   - Clique em "Esqueceu a senha?"
   - Digite seu email
   - Um link local será gerado (simulando envio por email)
   - Clique no link e defina nova senha

## 📱 Como Usar

### Cadastrar um Novo Kit

1. Clique no botão **"Cadastrar Kit"** no header
2. Digite o nome do kit
3. Adicione componentes:
   - Nome do componente
   - Quantidade
   - Estado (Bom/Usado)
4. Clique em "Cadastrar Kit"
5. **QR Code será gerado automaticamente!**

### Escanear QR Code

**Opção 1: Clique direto nos botões de scan**
- Os 6 primeiros kits aparecem na seção "Scanner"

**Opção 2: Use o QR Code físico**
- Ao cadastrar um kit, baixe o QR Code
- Imprima e cole na caixa do kit
- Escaneie com um app de QR Code
- Será redirecionado para os detalhes do kit

### Gerenciar Status

1. Abra os detalhes de um kit (clicando nele no Kanban ou escaneando)
2. Use os botões na parte inferior:
   - **✅ Organizado**: Kit conferido e completo
   - **⚠️ Para Conferência**: Kit devolvido, precisa verificação
   - **🔧 Em Uso**: Kit foi retirado
3. Adicione uma observação (opcional)

### Análise de IA

1. Role até a seção "Análise de IA"
2. Clique em "Executar Análise"
3. Veja:
   - Componentes mais perdidos
   - Recomendações de reposição
   - Prioridades (Alta/Média)

## 🌐 Acesso Externo (ngrok)

Para compartilhar o sistema na internet:

### 1️⃣ Baixar ngrok
https://ngrok.com/download

### 2️⃣ Executar servidor
```bash
python app.py
```

### 3️⃣ Em outro terminal
```bash
ngrok http 5000
```

### 4️⃣ Compartilhar URL
O ngrok fornecerá uma URL pública (ex: `https://abc123.ngrok.io`)

**Importante:** Ao usar ngrok, QR Codes apontarão para a URL pública automaticamente!

## 📂 Estrutura do Projeto

```
arduino-kit-manager/
├── app.py                      # Backend Flask com autenticação
├── requirements.txt            # Dependências Python
├── start.bat / start.sh        # Scripts de inicialização
│
├── data/
│   ├── kits.json              # Dados dos kits
│   ├── users.json             # Usuários cadastrados
│   └── reset_tokens.json      # Tokens de recuperação
│
├── templates/
│   ├── index.html             # Dashboard principal
│   ├── login.html             # Tela de login
│   ├── register.html          # Tela de cadastro
│   ├── forgot_password.html   # Recuperação de senha
│   └── reset_password.html    # Redefinir senha
│
└── static/
    ├── css/
    │   ├── style.css          # Estilos do dashboard
    │   └── auth.css           # Estilos de autenticação
    └── js/
        ├── app.js             # Lógica principal
        └── auth.js            # Funções de autenticação
```

## 🔒 Segurança

### Senhas
- Criptografadas com **Werkzeug PBKDF2**
- Nunca armazenadas em texto puro
- Gerador de senhas fortes incluído

### Tokens
- Recuperação de senha com **URLSafeTimedSerializer**
- Tokens expiram em 1 hora
- Válidos para uso único

### Sessões
- Flask-Login para gerenciamento
- Duração de 1 hora (configurável)
- Logout em todos os dispositivos

## 🎨 Personalização

### Alterar Cores

Edite `static/css/style.css`:

```css
:root {
  --color-primary: #00979D;      /* Verde-azulado */
  --color-primary-dark: #005F73; /* Verde-azulado escuro */
  --color-success: #10b981;      /* Verde */
  --color-warning: #f59e0b;      /* Amarelo */
  --color-danger: #ef4444;       /* Vermelho */
}
```

### Adicionar Campos ao Cadastro

Edite `templates/register.html` e `app.py` para adicionar novos campos.

### Customizar Email de Recuperação

Em produção, substitua a simulação em `app.py` por um serviço real (SendGrid, AWS SES, etc.)

## 🔧 API Endpoints

### Autenticação
```
POST /api/auth/register       # Cadastro
POST /api/auth/login          # Login
POST /api/auth/logout         # Logout
POST /api/auth/forgot-password    # Solicitar recuperação
POST /api/auth/reset-password     # Redefinir senha
GET  /api/auth/user           # Dados do usuário logado
GET  /api/auth/generate-passwords # Gerar senhas fortes
```

### Kits
```
GET    /api/kits              # Listar todos os kits
GET    /api/kit/<id>          # Detalhes de um kit
POST   /api/kit               # Criar novo kit
PUT    /api/kit/<id>          # Atualizar kit
DELETE /api/kit/<id>          # Deletar kit
PUT    /api/kit/<id>/status   # Atualizar status
GET    /api/qrcode/<id>       # Gerar QR Code
```

### Análise
```
GET /api/estatisticas         # Estatísticas gerais
GET /api/analise-ia           # Análise de componentes
```

## ❓ FAQ

### Como faço backup dos dados?

Copie a pasta `data/` regularmente. Ela contém:
- `kits.json`: Todos os kits
- `users.json`: Usuários cadastrados
- `reset_tokens.json`: Tokens ativos

### Posso usar em produção?

**Sim, mas:**
- Configure HTTPS (obrigatório)
- Use banco de dados real (PostgreSQL, MySQL)
- Configure envio real de emails
- Adicione rate limiting
- Configure backup automático

### QR Code não redireciona corretamente

O QR Code usa a URL base do servidor. Se usar ngrok, o QR será atualizado automaticamente. Se hospedar em outro domínio, configure `SERVER_NAME` no Flask.

### Esqueci minha senha e não tenho acesso ao link

Acesse `data/users.json` e delete o hash da senha do usuário, depois recadastre.

## 🐛 Solução de Problemas

### Erro: "ModuleNotFoundError"
```bash
pip install -r requirements.txt --force-reinstall
```

### Erro: "Port 5000 already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /F /PID <PID>

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Página em branco
1. Limpe cache do navegador (Ctrl+Shift+Del)
2. Tente em modo anônimo
3. Verifique console do navegador (F12)

## 📊 Tecnologias Utilizadas

**Backend:**
- Flask 3.0.0
- Flask-Login 0.6.3
- Werkzeug 3.0.1
- QRCode 7.4.2
- Pandas, NumPy, Scikit-learn

**Frontend:**
- HTML5, CSS3, JavaScript ES6+
- Design System personalizado
- Sem dependências externas (sem jQuery, Bootstrap, etc.)

**Segurança:**
- PBKDF2 SHA256 para hashing de senhas
- URLSafeTimedSerializer para tokens
- Flask-Login para sessões

## 📝 Licença

MIT License - Livre para uso comercial e pessoal

## 🙏 Contribuindo

Contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push (`git push origin feature/nova-funcionalidade`)
5. Pull Request

## 📞 Suporte

- **Issues:** Abra uma issue no GitHub
- **Documentação:** Veja `INSTALACAO.md` para detalhes
