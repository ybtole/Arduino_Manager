# 📦 Guia de Instalação Completo - Arduino Kit Manager

## 🎯 Visão Geral

Este guia fornece instruções detalhadas para instalar e configurar o Arduino Kit Manager, incluindo o sistema de autenticação, gerenciamento de kits e geração de QR Codes.

## 📋 Requisitos do Sistema

### Mínimos
- **SO:** Windows 7+, Linux (Ubuntu 18.04+), macOS 10.12+
- **Python:** 3.8 ou superior
- **RAM:** 2 GB
- **Espaço:** 200 MB

### Recomendados
- **Python:** 3.10+
- **RAM:** 4 GB
- **Navegador:** Chrome, Firefox, Safari ou Edge (versão recente)

---

## 🐍 Passo 1: Instalar Python

### Windows

1. Acesse: https://www.python.org/downloads/
2. Baixe Python 3.10+ 
3. **IMPORTANTE:** ☑️ Marque "Add Python to PATH"
4. Clique em "Install Now"

**Verificar:**
```bash
python --version
pip --version
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install python3 python3-pip
python3 --version
```

### macOS

```bash
# Com Homebrew
brew install python

# Verificar
python3 --version
```

---

## 📥 Passo 2: Baixar o Projeto

**Opção 1: Download ZIP**
1. Baixe o arquivo do projeto
2. Extraia para uma pasta (ex: `C:\arduino-kit-manager`)

**Opção 2: Git Clone**
```bash
git clone <url-do-repositorio>
cd arduino-kit-manager
```

---

## 📦 Passo 3: Instalar Dependências

Abra o terminal/prompt na pasta do projeto:

**Windows:**
```bash
pip install -r requirements.txt
```

**Linux/Mac:**
```bash
pip3 install -r requirements.txt
```

**Dependências que serão instaladas:**
- Flask 3.0.0 (framework web)
- Flask-Login 0.6.3 (autenticação)
- Flask-CORS 4.0.0 (CORS)
- Werkzeug 3.0.1 (segurança)
- QRCode 7.4.2 (geração de QR codes)
- Pillow 10.1.0 (processamento de imagens)
- itsdangerous 2.1.2 (tokens seguros)
- scikit-learn, pandas, numpy (análise de dados)

---

## 🚀 Passo 4: Executar o Sistema

### Método 1: Scripts de Inicialização (Recomendado)

**Windows:**
- Clique duas vezes em `start.bat`

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

### Método 2: Manual

```bash
python app.py
```

**Você verá:**
```
==========================================
🚀 SISTEMA DE GERENCIAMENTO DE KITS ARDUINO
==========================================
📡 Servidor rodando em: http://localhost:5000
🌐 Para acesso externo use ngrok: ngrok http 5000
==========================================
```

---

## 🌐 Passo 5: Acessar o Sistema

### Local

1. Abra seu navegador
2. Acesse: `http://localhost:5000`
3. Será redirecionado para a tela de login

### Primeiro Uso

**Criar sua conta:**

1. Clique em "Cadastre-se"
2. Preencha:
   - Nome completo
   - Email
   - Senha (mínimo 8 caracteres)
3. **Dica:** Clique em "🔐 Gerar Senha Forte" para sugestões
4. Confirme a senha
5. Clique em "Criar Conta"

**Você será automaticamente logado!**

---

## 🌍 Passo 6: Acesso Externo (ngrok)

Para que outras pessoas acessem o sistema pela internet:

### Instalar ngrok

**Windows:**
1. Baixe em: https://ngrok.com/download
2. Extraia `ngrok.exe`
3. Coloque em `C:\ngrok\`

**Linux:**
```bash
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin
```

**Mac:**
```bash
brew install ngrok/ngrok/ngrok
```

### Configurar ngrok

1. Crie conta em: https://dashboard.ngrok.com/signup
2. Copie seu authtoken
3. Execute:
```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

### Usar ngrok

**Terminal 1** (deixe rodando):
```bash
python app.py
```

**Terminal 2**:
```bash
ngrok http 5000
```

**Compartilhe a URL:**
```
Forwarding  https://abc123.ngrok.io -> http://localhost:5000
```

Envie `https://abc123.ngrok.io` para quem quiser acessar!

**Importante:** QR Codes gerados usarão automaticamente a URL do ngrok.

---

## 📱 Passo 7: Testar o Sistema

### 1. Cadastrar um Kit

1. Clique em "➕ Cadastrar Kit" no header
2. Digite: "Kit Arduino Básico"
3. Adicione componentes:
   - Arduino Uno R3 - Qtd: 1
   - LEDs - Qtd: 10
   - Resistores - Qtd: 20
4. Clique em "Cadastrar Kit"
5. **QR Code será exibido automaticamente!**
6. Baixe o QR Code

### 2. Escanear QR Code

**Opção 1:** Clique no botão "Escanear KIT001"

**Opção 2:** Use um app de QR Code no celular para escanear o código baixado

### 3. Gerenciar Status

1. Abra os detalhes do kit
2. Clique em "🔧 Marcar como Em Uso"
3. Adicione observação: "Retirado para aula de robótica"
4. Veja o kit mover no Kanban!

### 4. Executar Análise de IA

1. Role até "🤖 Análise de IA"
2. Clique em "🔍 Executar Análise"
3. Veja componentes mais perdidos e recomendações

### 5. Alternar Tema

- Clique no ícone ☀️/🌙 no header
- O tema será salvo automaticamente

---

## 🔒 Recursos de Segurança

### Senhas Fortes

O sistema inclui:
- ✅ Gerador de senhas de 16 caracteres
- ✅ Validação de força (mínimo 8 caracteres)
- ✅ Criptografia PBKDF2 SHA256
- ✅ Nunca armazenadas em texto puro

### Recuperação de Senha

1. Clique em "Esqueceu a senha?"
2. Digite seu email
3. Um link será gerado (simulado)
4. Clique no link
5. Defina nova senha

**Em produção:** Configure SMTP real para envio de emails.

### Sessões

- Duração: 1 hora (configurável)
- Logout automático após inatividade
- Sessão persistente com "Lembrar-me"

---

## 📁 Estrutura de Dados

Após a execução, serão criados:

```
data/
├── kits.json           # Kits cadastrados
├── users.json          # Usuários (senhas criptografadas)
└── reset_tokens.json   # Tokens de recuperação
```

**Backup:** Copie regularmente a pasta `data/`!

---

## ⚙️ Configurações Avançadas

### Alterar Porta

Edite `app.py` (última linha):

```python
app.run(debug=True, host='0.0.0.0', port=8080)  # Mude 5000 para 8080
```

### Tempo de Sessão

Edite `app.py`:

```python
app.config['PERMANENT_SESSION_LIFETIME'] = 7200  # 2 horas (em segundos)
```

### Secret Key

**IMPORTANTE EM PRODUÇÃO:** Mude a secret key:

```python
app.config['SECRET_KEY'] = 'sua-chave-secreta-aqui-muito-complexa'
```

Gere uma com:
```python
import secrets
print(secrets.token_hex(32))
```

---

## 🐛 Solução de Problemas

### ❌ "Python não reconhecido"

**Solução:**
1. Reinstale Python marcando "Add to PATH"
2. OU adicione manualmente ao PATH

### ❌ "ModuleNotFoundError"

```bash
pip install -r requirements.txt --force-reinstall
```

### ❌ "Port 5000 already in use"

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /F /PID <PID>
```

**Linux/Mac:**
```bash
lsof -ti:5000 | xargs kill -9
```

### ❌ Página em Branco

1. Limpe cache: Ctrl+Shift+Del
2. Modo anônimo: Ctrl+Shift+N
3. Console do navegador (F12) → veja erros
4. Verifique se todos os arquivos estão presentes

### ❌ "Unauthorized" ao acessar /api/*

Você não está logado. Acesse `/login` primeiro.

### ❌ QR Code não funciona

- Verifique se a URL base está correta
- Se usar ngrok, o QR será atualizado automaticamente
- Se hospedar em servidor próprio, configure `SERVER_NAME`

### ❌ Não consigo fazer login

1. Verifique email/senha
2. Veja `data/users.json` para confirmar cadastro
3. Tente recuperar senha

---

## 📊 Recursos de Produção

Para usar em produção real:

### 1. HTTPS

```bash
# Com Nginx + Let's Encrypt
sudo apt install nginx certbot
sudo certbot --nginx
```

### 2. Banco de Dados

Substitua JSON por PostgreSQL/MySQL:

```python
# Exemplo com SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:pass@localhost/arduino'
```

### 3. Email Real

Configure SMTP (ex: SendGrid, AWS SES):

```python
import smtplib
from email.mime.text import MIMEText

def enviar_email_recuperacao(email, link):
    msg = MIMEText(f"Clique aqui: {link}")
    msg['Subject'] = 'Recuperação de Senha'
    msg['From'] = 'noreply@seusite.com'
    msg['To'] = email
    
    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login('seu-email', 'sua-senha')
        server.send_message(msg)
```

### 4. Supervisor (Linux)

Para manter rodando em produção:

```bash
sudo apt install supervisor

# /etc/supervisor/conf.d/arduino-kit.conf
[program:arduino-kit]
command=/usr/bin/python3 /path/to/app.py
directory=/path/to/arduino-kit-manager
autostart=true
autorestart=true
```

### 5. Backup Automático

```bash
# Cron job diário
0 2 * * * cp -r /path/to/data /backups/$(date +\%Y\%m\%d)
```

---

## ✅ Checklist de Instalação

- [ ] Python 3.8+ instalado
- [ ] Dependências instaladas
- [ ] Servidor iniciado sem erros
- [ ] Login acessível em http://localhost:5000
- [ ] Conta criada com sucesso
- [ ] Kit cadastrado e QR Code gerado
- [ ] Tema claro/escuro funcionando
- [ ] (Opcional) ngrok configurado

---

## 📞 Suporte

Se algo não funcionar:

1. Verifique os logs no terminal
2. Consulte a seção "Solução de Problemas"
3. Veja o console do navegador (F12)
4. Abra uma issue no GitHub

---

**Instalação concluída!** 🎉

Agora você está pronto para gerenciar seus kits Arduino de forma profissional!
