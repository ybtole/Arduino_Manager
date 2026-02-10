from flask import Flask, render_template, jsonify, request, redirect, url_for, session
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer
import json
import os
from datetime import datetime
import qrcode
from io import BytesIO
import base64
from collections import Counter
import secrets
import string

app = Flask(__name__)
CORS(app)

# Configurações de segurança
app.config['SECRET_KEY'] = 'arduino-kit-manager-secret-key-2025'
app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # 1 hora

# Login Manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Serializer para tokens de recuperação de senha
serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])

# Caminhos para arquivos de dados
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
KITS_FILE = os.path.join(DATA_DIR, 'kits.json')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')
RESET_TOKENS_FILE = os.path.join(DATA_DIR, 'reset_tokens.json')

# Classe de Usuário
class User(UserMixin):
    def __init__(self, id, nome, email, senha_hash):
        self.id = id
        self.nome = nome
        self.email = email
        self.senha_hash = senha_hash

# Funções auxiliares de dados
def carregar_dados(arquivo):
    """Carrega dados de um arquivo JSON"""
    if not os.path.exists(arquivo):
        return {}
    with open(arquivo, 'r', encoding='utf-8') as f:
        return json.load(f)

def salvar_dados(dados, arquivo):
    """Salva dados em um arquivo JSON"""
    os.makedirs(os.path.dirname(arquivo), exist_ok=True)
    with open(arquivo, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)

def carregar_kits():
    """Carrega os dados dos kits"""
    dados = carregar_dados(KITS_FILE)
    return dados.get('kits', [])

def salvar_kits(kits):
    """Salva os dados dos kits"""
    dados = {'kits': kits}
    salvar_dados(dados, KITS_FILE)

def carregar_usuarios():
    """Carrega os dados dos usuários"""
    return carregar_dados(USERS_FILE)

def salvar_usuarios(usuarios):
    """Salva os dados dos usuários"""
    salvar_dados(usuarios, USERS_FILE)

def gerar_qr_code(texto):
    """Gera um QR Code em base64"""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(texto)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"

def gerar_senha_forte():
    """Gera uma senha forte aleatória"""
    caracteres = string.ascii_letters + string.digits + "!@#$%&*"
    senha = ''.join(secrets.choice(caracteres) for _ in range(16))
    return senha

def gerar_sugestoes_senha():
    """Gera 3 sugestões de senhas fortes"""
    return [gerar_senha_forte() for _ in range(3)]

@login_manager.user_loader
def load_user(user_id):
    """Carrega um usuário pelo ID"""
    usuarios = carregar_usuarios()
    if user_id in usuarios:
        u = usuarios[user_id]
        return User(user_id, u['nome'], u['email'], u['senha_hash'])
    return None

# ===== ROTAS DE AUTENTICAÇÃO =====

@app.route('/')
def index():
    """Rota principal - redireciona para login se não autenticado"""
    if not current_user.is_authenticated:
        return redirect(url_for('login'))
    return render_template('index.html')

@app.route('/login')
def login():
    """Página de login"""
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    return render_template('login.html')

@app.route('/register')
def register():
    """Página de cadastro"""
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    return render_template('register.html')

@app.route('/forgot-password')
def forgot_password():
    """Página de recuperação de senha"""
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    return render_template('forgot_password.html')

@app.route('/reset-password/<token>')
def reset_password(token):
    """Página de redefinição de senha"""
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    return render_template('reset_password.html', token=token)

# ===== API DE AUTENTICAÇÃO =====

@app.route('/api/auth/login', methods=['POST'])
def api_login():
    """Login de usuário"""
    data = request.json
    email = data.get('email')
    senha = data.get('senha')
    
    usuarios = carregar_usuarios()
    
    # Busca usuário por email
    user_id = None
    user_data = None
    for uid, udata in usuarios.items():
        if udata['email'] == email:
            user_id = uid
            user_data = udata
            break
    
    if not user_data:
        return jsonify({'sucesso': False, 'mensagem': 'Email ou senha incorretos'}), 401
    
    # Verifica senha
    if not check_password_hash(user_data['senha_hash'], senha):
        return jsonify({'sucesso': False, 'mensagem': 'Email ou senha incorretos'}), 401
    
    # Faz login
    user = User(user_id, user_data['nome'], user_data['email'], user_data['senha_hash'])
    login_user(user, remember=True)
    
    return jsonify({
        'sucesso': True,
        'usuario': {
            'id': user_id,
            'nome': user_data['nome'],
            'email': user_data['email']
        }
    })

@app.route('/api/auth/register', methods=['POST'])
def api_register():
    """Cadastro de novo usuário"""
    data = request.json
    nome = data.get('nome')
    email = data.get('email')
    senha = data.get('senha')
    
    if not nome or not email or not senha:
        return jsonify({'sucesso': False, 'mensagem': 'Todos os campos são obrigatórios'}), 400
    
    usuarios = carregar_usuarios()
    
    # Verifica se email já existe
    for udata in usuarios.values():
        if udata['email'] == email:
            return jsonify({'sucesso': False, 'mensagem': 'Email já cadastrado'}), 400
    
    # Cria novo usuário
    user_id = str(len(usuarios) + 1)
    usuarios[user_id] = {
        'nome': nome,
        'email': email,
        'senha_hash': generate_password_hash(senha),
        'data_cadastro': datetime.now().isoformat()
    }
    
    salvar_usuarios(usuarios)
    
    # Faz login automático
    user = User(user_id, nome, email, usuarios[user_id]['senha_hash'])
    login_user(user, remember=True)
    
    return jsonify({
        'sucesso': True,
        'usuario': {
            'id': user_id,
            'nome': nome,
            'email': email
        }
    })

@app.route('/api/auth/logout', methods=['POST'])
@login_required
def api_logout():
    """Logout de usuário"""
    logout_user()
    return jsonify({'sucesso': True})

@app.route('/api/auth/forgot-password', methods=['POST'])
def api_forgot_password():
    """Solicita recuperação de senha"""
    data = request.json
    email = data.get('email')
    
    usuarios = carregar_usuarios()
    
    # Busca usuário por email
    user_id = None
    for uid, udata in usuarios.items():
        if udata['email'] == email:
            user_id = uid
            break
    
    if not user_id:
        return jsonify({'sucesso': False, 'mensagem': 'Email não encontrado'}), 404
    
    # Gera token de recuperação
    token = serializer.dumps(email, salt='password-reset-salt')
    
    # Salva token
    tokens = carregar_dados(RESET_TOKENS_FILE) if os.path.exists(RESET_TOKENS_FILE) else {}
    tokens[token] = {
        'email': email,
        'criado_em': datetime.now().isoformat()
    }
    salvar_dados(tokens, RESET_TOKENS_FILE)
    
    # Link de recuperação (local)
    reset_link = url_for('reset_password', token=token, _external=True)
    
    return jsonify({
        'sucesso': True,
        'mensagem': 'Email de recuperação enviado!',
        'reset_link': reset_link,
        'token': token  # Return token explicitly for frontend use
    })

@app.route('/api/auth/reset-password', methods=['POST'])
def api_reset_password():
    """Redefine a senha usando o token"""
    data = request.json
    token = data.get('token')
    nova_senha = data.get('senha')
    
    try:
        # Verifica token (válido por 1 hora)
        email = serializer.loads(token, salt='password-reset-salt', max_age=3600)
    except:
        return jsonify({'sucesso': False, 'mensagem': 'Token inválido ou expirado'}), 400
    
    usuarios = carregar_usuarios()
    
    # Atualiza senha
    for uid, udata in usuarios.items():
        if udata['email'] == email:
            usuarios[uid]['senha_hash'] = generate_password_hash(nova_senha)
            salvar_usuarios(usuarios)
            
            # Remove token usado
            if os.path.exists(RESET_TOKENS_FILE):
                tokens = carregar_dados(RESET_TOKENS_FILE)
                if token in tokens:
                    del tokens[token]
                    salvar_dados(tokens, RESET_TOKENS_FILE)
            
            return jsonify({'sucesso': True, 'mensagem': 'Senha redefinida com sucesso!'})
    
    return jsonify({'sucesso': False, 'mensagem': 'Usuário não encontrado'}), 404

@app.route('/api/auth/user', methods=['GET'])
@login_required
def api_get_user():
    """Retorna informações do usuário logado"""
    return jsonify({
        'id': current_user.id,
        'nome': current_user.nome,
        'email': current_user.email
    })

@app.route('/api/auth/generate-passwords', methods=['GET'])
def api_generate_passwords():
    """Gera sugestões de senhas fortes"""
    return jsonify({'sugestoes': gerar_sugestoes_senha()})

# ===== API DE KITS =====

@app.route('/api/kits', methods=['GET'])
@login_required
def get_kits():
    """Retorna todos os kits"""
    kits = carregar_kits()
    return jsonify(kits)

@app.route('/api/kit/<kit_id>', methods=['GET'])
@login_required
def get_kit(kit_id):
    """Retorna informações de um kit específico"""
    kits = carregar_kits()
    kit = next((k for k in kits if k['id'] == kit_id), None)
    
    if kit:
        # Adiciona QR Code ao kit
        kit['qr_code'] = gerar_qr_code(url_for('index', _external=True) + f'#kit/{kit_id}')
        return jsonify(kit)
    else:
        return jsonify({'erro': 'Kit não encontrado'}), 404

@app.route('/api/kit', methods=['POST'])
@login_required
def criar_kit():
    """Cria um novo kit"""
    data = request.json
    nome = data.get('nome')
    componentes = data.get('componentes', [])
    
    if not nome:
        return jsonify({'erro': 'Nome do kit é obrigatório'}), 400
    
    kits = carregar_kits()
    
    # Gera ID único
    kit_id = f"KIT{str(len(kits) + 1).zfill(3)}"
    
    # Cria novo kit
    novo_kit = {
        'id': kit_id,
        'nome': nome,
        'status': 'organizado',
        'ultima_atualizacao': datetime.now().isoformat(),
        'responsavel': '',
        'componentes': componentes,
        'historico': [{
            'data': datetime.now().isoformat(),
            'acao': 'criacao',
            'responsavel': current_user.nome,
            'observacao': 'Kit criado'
        }],
        'criado_por': current_user.nome,
        'criado_em': datetime.now().isoformat()
    }
    
    kits.append(novo_kit)
    salvar_kits(kits)
    
    # Gera QR Code
    novo_kit['qr_code'] = gerar_qr_code(url_for('index', _external=True) + f'#kit/{kit_id}')
    
    return jsonify({'sucesso': True, 'kit': novo_kit})

@app.route('/api/kit/<kit_id>', methods=['PUT'])
@login_required
def atualizar_kit(kit_id):
    """Atualiza um kit existente"""
    data = request.json
    kits = carregar_kits()
    
    kit_index = next((i for i, k in enumerate(kits) if k['id'] == kit_id), None)
    
    if kit_index is None:
        return jsonify({'erro': 'Kit não encontrado'}), 404
    
    # Atualiza dados
    if 'nome' in data:
        kits[kit_index]['nome'] = data['nome']
    if 'componentes' in data:
        kits[kit_index]['componentes'] = data['componentes']
    
    kits[kit_index]['ultima_atualizacao'] = datetime.now().isoformat()
    
    # Adiciona ao histórico
    kits[kit_index]['historico'].append({
        'data': datetime.now().isoformat(),
        'acao': 'edicao',
        'responsavel': current_user.nome,
        'observacao': 'Kit editado'
    })
    
    salvar_kits(kits)
    
    return jsonify({'sucesso': True, 'kit': kits[kit_index]})

@app.route('/api/kit/<kit_id>', methods=['DELETE'])
@login_required
def deletar_kit(kit_id):
    """Deleta um kit"""
    kits = carregar_kits()
    
    kits = [k for k in kits if k['id'] != kit_id]
    salvar_kits(kits)
    
    return jsonify({'sucesso': True})

@app.route('/api/kit/<kit_id>/status', methods=['PUT'])
@login_required
def atualizar_status(kit_id):
    """Atualiza o status de um kit"""
    data = request.json
    novo_status = data.get('status')
    responsavel = data.get('responsavel', current_user.nome)
    observacao = data.get('observacao', '')
    
    kits = carregar_kits()
    kit_index = next((i for i, k in enumerate(kits) if k['id'] == kit_id), None)
    
    if kit_index is None:
        return jsonify({'erro': 'Kit não encontrado'}), 404
    
    kits[kit_index]['status'] = novo_status
    kits[kit_index]['responsavel'] = responsavel
    kits[kit_index]['ultima_atualizacao'] = datetime.now().isoformat()
    
    # Adiciona ao histórico
    historico_item = {
        'data': datetime.now().isoformat(),
        'acao': 'mudanca_status',
        'status': novo_status,
        'responsavel': responsavel,
        'observacao': observacao
    }
    kits[kit_index]['historico'].append(historico_item)
    
    salvar_kits(kits)
    return jsonify({'sucesso': True, 'kit': kits[kit_index]})

@app.route('/api/kit/<kit_id>/componentes', methods=['PUT'])
@login_required
def atualizar_componentes(kit_id):
    """Atualiza os componentes de um kit após conferência"""
    data = request.json
    componentes_atualizados = data.get('componentes', [])
    responsavel = data.get('responsavel', current_user.nome)
    
    kits = carregar_kits()
    kit_index = next((i for i, k in enumerate(kits) if k['id'] == kit_id), None)
    
    if kit_index is None:
        return jsonify({'erro': 'Kit não encontrado'}), 404
    
    # Atualiza componentes
    for comp_atualizado in componentes_atualizados:
        for i, comp in enumerate(kits[kit_index]['componentes']):
            if comp['nome'] == comp_atualizado['nome']:
                kits[kit_index]['componentes'][i] = comp_atualizado
                break
    
    kits[kit_index]['ultima_atualizacao'] = datetime.now().isoformat()
    
    # Adiciona ao histórico
    historico_item = {
        'data': datetime.now().isoformat(),
        'acao': 'conferencia',
        'responsavel': responsavel,
        'observacao': 'Componentes conferidos e atualizados'
    }
    kits[kit_index]['historico'].append(historico_item)
    
    salvar_kits(kits)
    return jsonify({'sucesso': True, 'kit': kits[kit_index]})

@app.route('/api/estatisticas', methods=['GET'])
@login_required
def get_estatisticas():
    """Retorna estatísticas gerais do sistema"""
    kits = carregar_kits()
    
    total_kits = len(kits)
    em_uso = sum(1 for k in kits if k['status'] == 'em-uso')
    para_conferencia = sum(1 for k in kits if k['status'] == 'para-conferencia')
    organizado = sum(1 for k in kits if k['status'] == 'organizado')
    
    # Calcula componentes com problemas
    componentes_problematicos = []
    for kit in kits:
        for comp in kit['componentes']:
            if comp.get('estado') in ['perdido', 'danificado', 'faltando']:
                componentes_problematicos.append(comp['nome'])
    
    return jsonify({
        'total_kits': total_kits,
        'em_uso': em_uso,
        'para_conferencia': para_conferencia,
        'organizado': organizado,
        'componentes_problematicos': Counter(componentes_problematicos).most_common(5)
    })

@app.route('/api/analise-ia', methods=['GET'])
@login_required
def analise_ia():
    """Análise de IA para componentes frequentemente perdidos"""
    kits = carregar_kits()
    
    # Coleta todos os componentes com problemas
    todos_problemas = []
    for kit in kits:
        for comp in kit['componentes']:
            if comp.get('quantidade', 0) < comp.get('quantidade_esperada', 0):
                diferenca = comp['quantidade_esperada'] - comp['quantidade']
                todos_problemas.append({
                    'componente': comp['nome'],
                    'kit': kit['nome'],
                    'faltando': diferenca,
                    'estado': comp.get('estado', 'faltando')
                })
    
    # Análise de frequência
    componentes_freq = Counter([p['componente'] for p in todos_problemas])
    
    # Recomendações baseadas em padrões
    recomendacoes = []
    for comp, freq in componentes_freq.most_common(5):
        if freq >= 2:
            recomendacoes.append({
                'componente': comp,
                'frequencia': freq,
                'recomendacao': f'Considere aumentar o estoque de {comp}. Perdido em {freq} kits.',
                'prioridade': 'alta' if freq >= 3 else 'média'
            })
    
    return jsonify({
        'problemas_atuais': todos_problemas,
        'componentes_mais_perdidos': [
            {'nome': nome, 'frequencia': freq} 
            for nome, freq in componentes_freq.most_common(10)
        ],
        'recomendacoes': recomendacoes,
        'total_problemas': len(todos_problemas)
    })

@app.route('/api/qrcode/<kit_id>', methods=['GET'])
@login_required
def get_qrcode(kit_id):
    """Gera QR Code para um kit específico"""
    qr_code_url = url_for('index', _external=True) + f'#kit/{kit_id}'
    qr_code = gerar_qr_code(qr_code_url)
    return jsonify({'qr_code': qr_code, 'kit_id': kit_id, 'url': qr_code_url})

if __name__ == '__main__':
    # Cria a pasta data se não existir
    os.makedirs(DATA_DIR, exist_ok=True)
    
    # Inicializa arquivos se não existirem
    if not os.path.exists(USERS_FILE):
        salvar_usuarios({})
    
    if not os.path.exists(KITS_FILE):
        salvar_kits([])
    
    print("=" * 60)
    print("🚀 SISTEMA DE GERENCIAMENTO DE KITS ARDUINO")
    print("=" * 60)
    print("📡 Servidor rodando em: http://localhost:5000")
    print("🌐 Para acesso externo use ngrok: ngrok http 5000")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
