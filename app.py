from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import json
import os
from datetime import datetime
import qrcode
from io import BytesIO
import base64
from collections import Counter

app = Flask(__name__)
CORS(app)

# Caminho para o arquivo de dados
DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'kits.json')

def carregar_dados():
    """Carrega os dados dos kits do arquivo JSON"""
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def salvar_dados(dados):
    """Salva os dados dos kits no arquivo JSON"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)

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

@app.route('/')
def index():
    """Rota principal - renderiza a página HTML"""
    return render_template('index.html')

@app.route('/api/kits', methods=['GET'])
def get_kits():
    """Retorna todos os kits"""
    dados = carregar_dados()
    return jsonify(dados['kits'])

@app.route('/api/kit/<kit_id>', methods=['GET'])
def get_kit(kit_id):
    """Retorna informações de um kit específico"""
    dados = carregar_dados()
    kit = next((k for k in dados['kits'] if k['id'] == kit_id), None)
    
    if kit:
        # Adiciona QR Code ao kit
        kit['qr_code'] = gerar_qr_code(kit_id)
        return jsonify(kit)
    else:
        return jsonify({'erro': 'Kit não encontrado'}), 404

@app.route('/api/kit/<kit_id>/status', methods=['PUT'])
def atualizar_status(kit_id):
    """Atualiza o status de um kit"""
    dados = carregar_dados()
    novo_status = request.json.get('status')
    responsavel = request.json.get('responsavel', '')
    observacao = request.json.get('observacao', '')
    
    kit = next((k for k in dados['kits'] if k['id'] == kit_id), None)
    
    if kit:
        kit['status'] = novo_status
        kit['responsavel'] = responsavel
        kit['ultima_atualizacao'] = datetime.now().isoformat()
        
        # Adiciona ao histórico
        historico_item = {
            'data': datetime.now().isoformat(),
            'acao': 'mudanca_status',
            'status': novo_status,
            'responsavel': responsavel,
            'observacao': observacao
        }
        kit['historico'].append(historico_item)
        
        salvar_dados(dados)
        return jsonify({'sucesso': True, 'kit': kit})
    else:
        return jsonify({'erro': 'Kit não encontrado'}), 404

@app.route('/api/kit/<kit_id>/componentes', methods=['PUT'])
def atualizar_componentes(kit_id):
    """Atualiza os componentes de um kit após conferência"""
    dados = carregar_dados()
    componentes_atualizados = request.json.get('componentes', [])
    responsavel = request.json.get('responsavel', '')
    
    kit = next((k for k in dados['kits'] if k['id'] == kit_id), None)
    
    if kit:
        # Atualiza componentes
        for comp_atualizado in componentes_atualizados:
            for i, comp in enumerate(kit['componentes']):
                if comp['nome'] == comp_atualizado['nome']:
                    kit['componentes'][i] = comp_atualizado
                    break
        
        kit['ultima_atualizacao'] = datetime.now().isoformat()
        
        # Adiciona ao histórico
        historico_item = {
            'data': datetime.now().isoformat(),
            'acao': 'conferencia',
            'responsavel': responsavel,
            'observacao': 'Componentes conferidos e atualizados'
        }
        kit['historico'].append(historico_item)
        
        salvar_dados(dados)
        return jsonify({'sucesso': True, 'kit': kit})
    else:
        return jsonify({'erro': 'Kit não encontrado'}), 404

@app.route('/api/estatisticas', methods=['GET'])
def get_estatisticas():
    """Retorna estatísticas gerais do sistema"""
    dados = carregar_dados()
    kits = dados['kits']
    
    total_kits = len(kits)
    em_uso = sum(1 for k in kits if k['status'] == 'em-uso')
    para_conferencia = sum(1 for k in kits if k['status'] == 'para-conferencia')
    organizado = sum(1 for k in kits if k['status'] == 'organizado')
    
    # Calcula componentes com problemas
    componentes_problematicos = []
    for kit in kits:
        for comp in kit['componentes']:
            if comp['estado'] in ['perdido', 'danificado', 'faltando']:
                componentes_problematicos.append(comp['nome'])
    
    return jsonify({
        'total_kits': total_kits,
        'em_uso': em_uso,
        'para_conferencia': para_conferencia,
        'organizado': organizado,
        'componentes_problematicos': Counter(componentes_problematicos).most_common(5)
    })

@app.route('/api/analise-ia', methods=['GET'])
def analise_ia():
    """Análise de IA para componentes frequentemente perdidos"""
    dados = carregar_dados()
    
    # Coleta todos os componentes com problemas
    todos_problemas = []
    for kit in dados['kits']:
        for comp in kit['componentes']:
            if comp['quantidade'] < comp['quantidade_esperada']:
                diferenca = comp['quantidade_esperada'] - comp['quantidade']
                todos_problemas.append({
                    'componente': comp['nome'],
                    'kit': kit['nome'],
                    'faltando': diferenca,
                    'estado': comp['estado']
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
def get_qrcode(kit_id):
    """Gera QR Code para um kit específico"""
    qr_code = gerar_qr_code(kit_id)
    return jsonify({'qr_code': qr_code, 'kit_id': kit_id})

if __name__ == '__main__':
    # Cria a pasta data se não existir
    os.makedirs(os.path.join(os.path.dirname(__file__), 'data'), exist_ok=True)
    
    print("=" * 60)
    print("🚀 SISTEMA DE GERENCIAMENTO DE KITS ARDUINO")
    print("=" * 60)
    print("📡 Servidor rodando em: http://localhost:5000")
    print("🌐 Para acesso externo use ngrok: ngrok http 5000")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
