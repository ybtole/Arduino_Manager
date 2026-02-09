# 📦 Guia de Instalação - Arduino Kit Manager

Este guia fornece instruções passo a passo para instalar e executar o Arduino Kit Manager.

## 📋 Índice

1. [Requisitos do Sistema](#requisitos-do-sistema)
2. [Instalação do Python](#instalação-do-python)
3. [Instalação do Projeto](#instalação-do-projeto)
4. [Primeiro Acesso](#primeiro-acesso)
5. [Configuração para Acesso Externo](#configuração-para-acesso-externo)
6. [Solução de Problemas](#solução-de-problemas)

---

## 🖥️ Requisitos do Sistema

### Mínimos
- **Sistema Operacional**: Windows 7+, Linux, ou macOS 10.12+
- **RAM**: 2 GB
- **Espaço em Disco**: 200 MB
- **Navegador**: Chrome, Firefox, Safari ou Edge (versões recentes)

### Recomendados
- **RAM**: 4 GB ou mais
- **Conexão**: Internet para instalação de dependências

---

## 🐍 Instalação do Python

### Windows

#### Opção 1: Download Oficial

1. Acesse: https://www.python.org/downloads/
2. Baixe Python 3.8 ou superior
3. **IMPORTANTE**: Marque a opção "Add Python to PATH"
4. Clique em "Install Now"
5. Aguarde a instalação

#### Opção 2: Microsoft Store

1. Abra a Microsoft Store
2. Pesquise por "Python 3.11"
3. Clique em "Instalar"

#### Verificar Instalação

Abra o **Prompt de Comando** (cmd) e digite:

```bash
python --version
```

Deve exibir algo como: `Python 3.11.x`

### Linux (Ubuntu/Debian)

```bash
# Atualizar repositórios
sudo apt update

# Instalar Python 3 e pip
sudo apt install python3 python3-pip

# Verificar instalação
python3 --version
pip3 --version
```

### macOS

#### Opção 1: Homebrew (Recomendado)

```bash
# Instalar Homebrew (se ainda não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Python
brew install python

# Verificar
python3 --version
```

#### Opção 2: Download Oficial

1. Acesse: https://www.python.org/downloads/macos/
2. Baixe e instale o Python 3.8+

---

## 📥 Instalação do Projeto

### Método 1: Download Direto

1. **Baixe o projeto**
   - Baixe o arquivo ZIP do projeto
   - Extraia para uma pasta de sua preferência

2. **Abra o terminal/prompt na pasta**
   - **Windows**: Clique com botão direito na pasta → "Abrir no Terminal"
   - **Linux/Mac**: Navegue até a pasta pelo terminal

3. **Instale as dependências**

   **Windows:**
   ```bash
   pip install -r requirements.txt
   ```

   **Linux/Mac:**
   ```bash
   pip3 install -r requirements.txt
   ```

   Aguarde a instalação de todos os pacotes:
   - Flask
   - flask-cors
   - Pillow
   - qrcode
   - scikit-learn
   - pandas
   - numpy

4. **Execute o sistema**

   **Windows:**
   ```bash
   # Clique duas vezes no arquivo start.bat
   # OU execute no terminal:
   start.bat
   ```

   **Linux/Mac:**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

### Método 2: Git Clone (Avançado)

```bash
# Clone o repositório
git clone <url-do-repositorio>

# Entre na pasta
cd arduino-kit-manager

# Instale dependências
pip install -r requirements.txt

# Execute
python app.py
```

---

## 🚀 Primeiro Acesso

### 1. Iniciar o Servidor

Após executar `start.bat` ou `start.sh`, você verá:

```
========================================
🚀 SISTEMA DE GERENCIAMENTO DE KITS ARDUINO
========================================
📡 Servidor rodando em: http://localhost:5000
🌐 Para acesso externo use ngrok: ngrok http 5000
========================================
```

### 2. Acessar pelo Navegador

1. Abra seu navegador preferido
2. Digite na barra de endereços:
   ```
   http://localhost:5000
   ```
3. Pressione Enter

### 3. Você verá a tela inicial com:

- ✅ Header com logo e botão de tema
- 📱 Seção de scanner com 3 botões de kits
- 📊 Estatísticas (Total, Em Uso, Para Conferência, Organizados)
- 📋 Quadro Kanban com os kits
- 🤖 Seção de análise de IA

### 4. Teste o Sistema

1. Clique em "Escanear KIT001"
2. Visualize os componentes
3. Experimente mudar o status
4. Alterne entre modo claro/escuro (ícone 🌙/☀️)

---

## 🌐 Configuração para Acesso Externo

### Por que usar ngrok?

O ngrok permite que pessoas de **qualquer lugar** acessem seu sistema através de uma URL pública, mesmo que você esteja em uma rede corporativa ou residencial.

### Passo a Passo: ngrok

#### 1. Baixar ngrok

Acesse: https://ngrok.com/download

Escolha a versão para seu sistema operacional.

#### 2. Instalar

**Windows:**
1. Extraia o arquivo `ngrok.exe`
2. Coloque em uma pasta de fácil acesso (ex: `C:\ngrok\`)
3. Adicione ao PATH (opcional)

**Linux:**
```bash
# Baixar
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz

# Extrair
tar xvzf ngrok-v3-stable-linux-amd64.tgz

# Mover para /usr/local/bin
sudo mv ngrok /usr/local/bin
```

**Mac:**
```bash
# Com Homebrew
brew install ngrok/ngrok/ngrok
```

#### 3. Criar Conta (Gratuita)

1. Acesse: https://dashboard.ngrok.com/signup
2. Crie uma conta gratuita
3. Copie seu **authtoken**

#### 4. Autenticar

```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

#### 5. Executar

**Terminal 1** (deixe rodando):
```bash
python app.py
```

**Terminal 2** (novo terminal):
```bash
ngrok http 5000
```

#### 6. Compartilhar URL

O ngrok mostrará algo como:

```
Forwarding  https://abc123.ngrok.io -> http://localhost:5000
```

**Compartilhe** o link `https://abc123.ngrok.io` com quem quiser acessar!

### Alternativas ao ngrok

#### 1. LocalTunnel

```bash
# Instalar
npm install -g localtunnel

# Usar
lt --port 5000
```

#### 2. serveo.net (sem instalação)

```bash
ssh -R 80:localhost:5000 serveo.net
```

#### 3. Cloudflare Tunnel

```bash
# Instalar
# https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/

cloudflared tunnel --url http://localhost:5000
```

---

## 🐛 Solução de Problemas

### ❌ "Python não é reconhecido..."

**Problema**: Python não está no PATH

**Solução**:
1. Reinstale o Python marcando "Add to PATH"
2. OU adicione manualmente:
   - Windows: Painel de Controle → Sistema → Variáveis de Ambiente
   - Adicione `C:\Python3X` ao PATH

### ❌ "Porta 5000 já está em uso"

**Problema**: Outra aplicação está usando a porta 5000

**Solução**:

Edite `app.py` e mude a porta:

```python
# Última linha do arquivo
app.run(debug=True, host='0.0.0.0', port=8080)  # ← Mude para 8080 ou outra porta
```

Acesse: `http://localhost:8080`

### ❌ "ModuleNotFoundError: No module named 'flask'"

**Problema**: Dependências não instaladas

**Solução**:

```bash
# Windows
pip install -r requirements.txt --force-reinstall

# Linux/Mac
pip3 install -r requirements.txt --force-reinstall
```

### ❌ Página em Branco

**Problema**: Arquivos não carregam

**Soluções**:

1. **Limpar cache**:
   - Chrome: Ctrl+Shift+Del → Limpar cache
   - Firefox: Ctrl+Shift+Del → Limpar cache

2. **Modo anônimo**:
   - Ctrl+Shift+N (Chrome)
   - Ctrl+Shift+P (Firefox)

3. **Verificar console**:
   - F12 → Aba "Console"
   - Veja se há erros

4. **Verificar estrutura**:
   ```
   arduino-kit-manager/
   ├── templates/
   │   └── index.html  ← Deve existir
   └── static/
       ├── css/
       │   └── style.css  ← Deve existir
       └── js/
           └── app.js  ← Deve existir
   ```

### ❌ "Address already in use"

**Problema**: Flask já está rodando

**Solução**:

**Windows**:
```bash
# Encontrar processo
netstat -ano | findstr :5000

# Matar processo (substitua PID)
taskkill /F /PID numero_do_pid
```

**Linux/Mac**:
```bash
# Encontrar e matar
lsof -ti:5000 | xargs kill -9
```

### ❌ Erro 404 nos arquivos CSS/JS

**Problema**: Caminhos incorretos

**Solução**:

Verifique que `index.html` tem:

```html
<link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
<script src="{{ url_for('static', filename='js/app.js') }}"></script>
```

### ❌ ngrok: "authtoken not found"

**Problema**: Token não configurado

**Solução**:

```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

Pegue seu token em: https://dashboard.ngrok.com/get-started/your-authtoken

---

## 📞 Ainda com Problemas?

1. **Verifique os logs**:
   - Leia as mensagens no terminal
   - Procure por linhas com "ERROR"

2. **Console do navegador**:
   - F12 → Console
   - Veja erros em vermelho

3. **Teste com exemplo mínimo**:
   ```bash
   python -m flask --version
   ```
   Se funcionar, o Flask está OK.

4. **Crie uma issue**:
   - Descreva o problema
   - Inclua: Sistema operacional, versão do Python, mensagem de erro completa

---

## ✅ Checklist de Instalação

- [ ] Python 3.8+ instalado
- [ ] pip funcionando
- [ ] Dependências instaladas (`pip install -r requirements.txt`)
- [ ] Servidor iniciado sem erros
- [ ] Navegador acessando `http://localhost:5000`
- [ ] Interface carregando corretamente
- [ ] Kits aparecendo no Kanban
- [ ] Modal abrindo ao clicar em "Escanear"
- [ ] Tema claro/escuro funcionando

Se todos os itens estão ✅, parabéns! 🎉

O sistema está funcionando perfeitamente!

---

**Desenvolvido com ❤️ para facilitar o gerenciamento de kits Arduino**
