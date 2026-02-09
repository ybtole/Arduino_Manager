// ===== CONFIGURAÇÕES GLOBAIS =====
const API_BASE = '';
let kitsData = [];
let currentUser = null;
let componenteCounter = 0;

// ===== TEMA (Dark/Light Mode) =====
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Carrega tema salvo
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    carregarUsuarioLogado();
    carregarEstatisticas();
    carregarKits();
    
    // Verifica se há kit na URL (#kit/KIT001)
    const hash = window.location.hash;
    if (hash.startsWith('#kit/')) {
        const kitId = hash.replace('#kit/', '');
        setTimeout(() => {
            abrirDetalhesKit(kitId);
        }, 500);
    }
});

// ===== AUTENTICAÇÃO =====
async function carregarUsuarioLogado() {
    try {
        const response = await fetch(`${API_BASE}/api/auth/user`);
        if (response.ok) {
            currentUser = await response.json();
            atualizarInfoUsuario();
        } else {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        window.location.href = '/login';
    }
}

function atualizarInfoUsuario() {
    if (!currentUser) return;
    
    document.getElementById('userName').textContent = currentUser.nome;
    document.getElementById('userEmail').textContent = currentUser.email;
    
    // Iniciais do usuário
    const initials = currentUser.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    document.getElementById('userInitials').textContent = initials;
}

async function fazerLogout() {
    if (!confirm('Deseja realmente sair?')) return;
    
    try {
        await fetch(`${API_BASE}/api/auth/logout`, {
            method: 'POST'
        });
        window.location.href = '/login';
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        window.location.href = '/login';
    }
}

// ===== FUNÇÕES DE API =====
async function carregarEstatisticas() {
    try {
        const response = await fetch(`${API_BASE}/api/estatisticas`);
        const stats = await response.json();
        
        document.getElementById('totalKits').textContent = stats.total_kits;
        document.getElementById('emUso').textContent = stats.em_uso;
        document.getElementById('paraConferencia').textContent = stats.para_conferencia;
        document.getElementById('organizado').textContent = stats.organizado;
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

async function carregarKits() {
    try {
        const response = await fetch(`${API_BASE}/api/kits`);
        kitsData = await response.json();
        
        renderizarKanban();
        renderizarBotoesScanner();
    } catch (error) {
        console.error('Erro ao carregar kits:', error);
    }
}

function renderizarBotoesScanner() {
    const container = document.getElementById('scannerButtons');
    if (!kitsData || kitsData.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Nenhum kit cadastrado ainda. Clique em "Cadastrar Kit" para começar!</p>';
        return;
    }
    
    container.innerHTML = kitsData.slice(0, 6).map((kit, index) => {
        const classes = ['primary', 'warning', 'danger', 'primary', 'warning', 'danger'];
        const className = classes[index % classes.length];
        
        return `
            <button class="scan-btn ${className}" onclick="scanKit('${kit.id}')">
                <span class="icon">📷</span>
                <div>
                    <div class="btn-title">Escanear ${kit.id}</div>
                    <div class="btn-subtitle">${kit.nome}</div>
                </div>
            </button>
        `;
    }).join('');
}

function renderizarKanban() {
    const emUso = kitsData.filter(k => k.status === 'em-uso');
    const paraConferencia = kitsData.filter(k => k.status === 'para-conferencia');
    const organizado = kitsData.filter(k => k.status === 'organizado');
    
    document.getElementById('countEmUso').textContent = emUso.length;
    document.getElementById('countParaConferencia').textContent = paraConferencia.length;
    document.getElementById('countOrganizado').textContent = organizado.length;
    
    document.getElementById('columnEmUso').innerHTML = emUso.map(criarKitCard).join('');
    document.getElementById('columnParaConferencia').innerHTML = paraConferencia.map(criarKitCard).join('');
    document.getElementById('columnOrganizado').innerHTML = organizado.map(criarKitCard).join('');
}

function criarKitCard(kit) {
    const componentesComProblema = kit.componentes.filter(c => 
        c.estado === 'perdido' || c.estado === 'danificado' || c.quantidade < c.quantidade_esperada
    );
    
    const statusBadge = componentesComProblema.length === 0 
        ? '<span class="kit-badge badge-ok">✓ Completo</span>'
        : `<span class="kit-badge badge-warning">⚠️ ${componentesComProblema.length} problema(s)</span>`;
    
    const ultimaAtualizacao = new Date(kit.ultima_atualizacao).toLocaleString('pt-BR');
    
    return `
        <div class="kit-card" onclick="abrirDetalhesKit('${kit.id}')">
            <div class="kit-card-header">
                <div>
                    <div class="kit-id">${kit.id}</div>
                    <div class="kit-name">${kit.nome}</div>
                </div>
            </div>
            <div class="kit-info">
                ${kit.responsavel ? `👤 ${kit.responsavel}<br>` : ''}
                🕐 ${ultimaAtualizacao}
            </div>
            ${statusBadge}
        </div>
    `;
}

// ===== SCANNER DE QR CODE =====
async function scanKit(kitId) {
    abrirDetalhesKit(kitId);
}

async function abrirDetalhesKit(kitId) {
    try {
        const response = await fetch(`${API_BASE}/api/kit/${kitId}`);
        const kit = await response.json();
        
        if (kit.erro) {
            alert('Kit não encontrado!');
            return;
        }
        
        mostrarModalKit(kit);
    } catch (error) {
        console.error('Erro ao carregar detalhes do kit:', error);
        alert('Erro ao carregar detalhes do kit');
    }
}

function mostrarModalKit(kit) {
    const modal = document.getElementById('kitModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = `${kit.id} - ${kit.nome}`;
    
    const componentesHTML = kit.componentes.map(comp => {
        let statusClass = 'ok';
        let statusIcon = '✓';
        
        if (comp.estado === 'perdido') {
            statusClass = 'error';
            statusIcon = '✗';
        } else if (comp.estado === 'danificado') {
            statusClass = 'error';
            statusIcon = '⚠';
        } else if (comp.quantidade < comp.quantidade_esperada) {
            statusClass = 'warning';
            statusIcon = '⚠';
        }
        
        const icon = getComponentIcon(comp.nome);
        
        return `
            <div class="component-card ${statusClass}">
                <div class="component-icon">${icon}</div>
                <div class="component-name">${comp.nome}</div>
                <div class="component-qty ${statusClass}">
                    ${comp.quantidade}/${comp.quantidade_esperada}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.5rem;">
                    ${statusIcon} ${comp.estado}
                </div>
            </div>
        `;
    }).join('');
    
    const historicoHTML = kit.historico && kit.historico.length > 0 
        ? kit.historico.map(h => `
            <div class="ai-item">
                <div>
                    <strong>${h.acao}</strong> - ${h.responsavel || 'Sistema'}<br>
                    <small>${new Date(h.data).toLocaleString('pt-BR')}</small><br>
                    ${h.observacao ? `<em>${h.observacao}</em>` : ''}
                </div>
            </div>
        `).join('')
        : '<p style="color: var(--text-secondary);">Nenhum histórico registrado</p>';
    
    modalBody.innerHTML = `
        <div class="qr-code-container">
            <img src="${kit.qr_code}" alt="QR Code ${kit.id}">
            <p style="margin-top: 1rem; font-weight: 600;">${kit.id}</p>
            <button class="btn-secondary" onclick="baixarQRCode('${kit.id}')">
                ⬇️ Baixar QR Code
            </button>
        </div>
        
        <div style="margin: 2rem 0;">
            <h3 style="margin-bottom: 1rem;">📦 Componentes do Kit</h3>
            <div class="components-grid">
                ${componentesHTML}
            </div>
        </div>
        
        <div style="margin: 2rem 0;">
            <h3 style="margin-bottom: 1rem;">📋 Informações</h3>
            <div class="ai-card">
                <p><strong>Status:</strong> ${traduzirStatus(kit.status)}</p>
                <p><strong>Responsável:</strong> ${kit.responsavel || 'Nenhum'}</p>
                <p><strong>Última Atualização:</strong> ${new Date(kit.ultima_atualizacao).toLocaleString('pt-BR')}</p>
                ${kit.criado_por ? `<p><strong>Criado por:</strong> ${kit.criado_por}</p>` : ''}
            </div>
        </div>
        
        <div style="margin: 2rem 0;">
            <h3 style="margin-bottom: 1rem;">📜 Histórico</h3>
            <div class="ai-card">
                ${historicoHTML}
            </div>
        </div>
        
        <div style="display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap;">
            <button class="btn btn-success" onclick="mudarStatus('${kit.id}', 'organizado')">
                <span class="icon">✅</span>
                Marcar como Organizado
            </button>
            <button class="btn btn-warning" onclick="mudarStatus('${kit.id}', 'para-conferencia')">
                <span class="icon">⚠️</span>
                Enviar para Conferência
            </button>
            <button class="btn btn-primary" onclick="mudarStatus('${kit.id}', 'em-uso')">
                <span class="icon">🔧</span>
                Marcar como Em Uso
            </button>
            <button class="btn btn-danger" onclick="deletarKit('${kit.id}')">
                <span class="icon">🗑️</span>
                Deletar Kit
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}

async function baixarQRCode(kitId) {
    try {
        const response = await fetch(`${API_BASE}/api/qrcode/${kitId}`);
        const data = await response.json();
        
        // Cria link de download
        const link = document.createElement('a');
        link.href = data.qr_code;
        link.download = `${kitId}_qrcode.png`;
        link.click();
    } catch (error) {
        console.error('Erro ao baixar QR Code:', error);
    }
}

function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// Fecha modal clicando fora
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});

async function mudarStatus(kitId, novoStatus) {
    const observacao = prompt('Observação (opcional):') || '';
    
    try {
        const response = await fetch(`${API_BASE}/api/kit/${kitId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: novoStatus,
                responsavel: currentUser.nome,
                observacao: observacao
            })
        });
        
        const result = await response.json();
        
        if (result.sucesso) {
            alert('Status atualizado com sucesso!');
            fecharModal('kitModal');
            carregarEstatisticas();
            carregarKits();
        } else {
            alert('Erro ao atualizar status');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar status');
    }
}

async function deletarKit(kitId) {
    if (!confirm(`Tem certeza que deseja deletar o kit ${kitId}? Esta ação não pode ser desfeita!`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/kit/${kitId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.sucesso) {
            alert('Kit deletado com sucesso!');
            fecharModal('kitModal');
            carregarEstatisticas();
            carregarKits();
        } else {
            alert('Erro ao deletar kit');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao deletar kit');
    }
}

// ===== ANÁLISE DE IA =====
async function carregarAnaliseIA() {
    const container = document.getElementById('aiAnalysis');
    container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">🔄 Analisando dados...</p>';
    
    try {
        const response = await fetch(`${API_BASE}/api/analise-ia`);
        const analise = await response.json();
        
        const componentesHTML = analise.componentes_mais_perdidos
            .map(c => `
                <div class="ai-item">
                    <span>${c.nome}</span>
                    <span class="priority-badge priority-alta">${c.frequencia}x perdido</span>
                </div>
            `).join('');
        
        const recomendacoesHTML = analise.recomendacoes.length > 0
            ? analise.recomendacoes.map(r => `
                <div class="ai-item">
                    <div>
                        <strong>${r.componente}</strong><br>
                        <small>${r.recomendacao}</small>
                    </div>
                    <span class="priority-badge priority-${r.prioridade}">${r.prioridade}</span>
                </div>
            `).join('')
            : '<p style="color: var(--text-secondary);">Nenhuma recomendação no momento</p>';
        
        container.innerHTML = `
            <div class="ai-card">
                <div class="ai-title">🎯 Componentes Mais Perdidos</div>
                ${componentesHTML}
            </div>
            
            <div class="ai-card">
                <div class="ai-title">💡 Recomendações</div>
                ${recomendacoesHTML}
            </div>
            
            <div class="ai-card">
                <div class="ai-title">📊 Resumo</div>
                <p><strong>Total de problemas detectados:</strong> ${analise.total_problemas}</p>
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">
                    A IA analisou ${kitsData.length} kits e identificou padrões de perda e dano.
                </p>
            </div>
        `;
    } catch (error) {
        console.error('Erro ao carregar análise:', error);
        container.innerHTML = '<p style="color: var(--color-danger);">Erro ao carregar análise de IA</p>';
    }
}

// ===== CADASTRO DE KIT =====
function abrirModalCadastroKit() {
    const modal = document.getElementById('cadastroKitModal');
    document.getElementById('cadastroKitForm').reset();
    document.getElementById('componentesContainer').innerHTML = '';
    componenteCounter = 0;
    
    // Adiciona 3 componentes iniciais
    for (let i = 0; i < 3; i++) {
        adicionarComponente();
    }
    
    modal.classList.add('active');
}

function adicionarComponente() {
    const container = document.getElementById('componentesContainer');
    const id = ++componenteCounter;
    
    const div = document.createElement('div');
    div.className = 'componente-item';
    div.id = `componente-${id}`;
    div.innerHTML = `
        <input type="text" placeholder="Nome do componente" id="nome-${id}" required>
        <input type="number" placeholder="Quantidade" id="qtd-${id}" min="1" value="1" required>
        <select id="estado-${id}">
            <option value="bom">Bom</option>
            <option value="usado">Usado</option>
        </select>
        <button type="button" class="btn-remover" onclick="removerComponente(${id})">🗑️</button>
    `;
    
    container.appendChild(div);
}

function removerComponente(id) {
    const elemento = document.getElementById(`componente-${id}`);
    if (elemento) {
        elemento.remove();
    }
}

document.getElementById('cadastroKitForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btnText = document.getElementById('btnCadastroText');
    const btnLoader = document.getElementById('btnCadastroLoader');
    
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
    
    const nome = document.getElementById('nomeKit').value;
    const componentes = [];
    
    // Coleta componentes
    const componenteItems = document.querySelectorAll('.componente-item');
    componenteItems.forEach(item => {
        const id = item.id.split('-')[1];
        const nomeComp = document.getElementById(`nome-${id}`).value;
        const qtd = parseInt(document.getElementById(`qtd-${id}`).value);
        const estado = document.getElementById(`estado-${id}`).value;
        
        if (nomeComp && qtd) {
            componentes.push({
                nome: nomeComp,
                quantidade: qtd,
                quantidade_esperada: qtd,
                estado: estado,
                imagem: ''
            });
        }
    });
    
    if (componentes.length === 0) {
        alert('Adicione pelo menos um componente!');
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/kit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: nome,
                componentes: componentes
            })
        });
        
        const result = await response.json();
        
        if (result.sucesso) {
            alert(`Kit ${result.kit.id} cadastrado com sucesso!`);
            fecharModal('cadastroKitModal');
            carregarEstatisticas();
            carregarKits();
            
            // Mostra QR Code
            mostrarQRCode(result.kit);
        } else {
            alert('Erro ao cadastrar kit');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao cadastrar kit');
    } finally {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
});

function mostrarQRCode(kit) {
    const modal = document.getElementById('qrcodeModal');
    const container = document.getElementById('qrcodeContainer');
    
    container.innerHTML = `
        <h3>${kit.id} - ${kit.nome}</h3>
        <img src="${kit.qr_code}" alt="QR Code ${kit.id}" style="max-width: 300px; border: 4px solid var(--border-color); border-radius: var(--radius-md); margin: 1rem auto;">
        <p style="color: var(--text-secondary); margin: 1rem 0;">
            QR Code gerado com sucesso! Use-o para acessar o kit rapidamente.
        </p>
        <button class="btn btn-primary" onclick="baixarQRCode('${kit.id}')">
            ⬇️ Baixar QR Code
        </button>
    `;
    
    modal.classList.add('active');
}

// ===== FUNÇÕES AUXILIARES =====
function getComponentIcon(nome) {
    const icons = {
        'Arduino Uno R3': '🔧',
        'Arduino Mega 2560': '🔧',
        'Arduino Nano': '🔧',
        'Cabo USB': '🔌',
        'Protoboard': '📟',
        'Breadboard': '📟',
        'LED': '💡',
        'Resistor': '🔴',
        'Jumper': '📎',
        'Push Button': '🔘',
        'Button': '🔘',
        'Botão': '🔘',
        'Sensor Ultrassônico': '📡',
        'Sensor DHT11': '🌡️',
        'Sensor': '📡',
        'Display LCD': '📺',
        'LCD': '📺',
        'Servo Motor': '⚙️',
        'Servo': '⚙️',
        'Motor': '🔄',
        'Módulo WiFi': '📶',
        'WiFi': '📶',
        'ESP8266': '📶',
        'ESP32': '📶',
        'Sensor de Gás': '💨',
        'Módulo RFID': '📱',
        'RFID': '📱',
        'Matriz LED': '🔳',
        'Capacitor': '🔋',
        'Bateria': '🔋',
        'Relé': '🔌',
        'Driver': '💿'
    };
    
    for (const [key, icon] of Object.entries(icons)) {
        if (nome.includes(key) || nome.toLowerCase().includes(key.toLowerCase())) {
            return icon;
        }
    }
    
    return '📦';
}

function traduzirStatus(status) {
    const traducoes = {
        'em-uso': '🔧 Em Uso',
        'para-conferencia': '⚠️ Para Conferência',
        'organizado': '✅ Organizado'
    };
    return traducoes[status] || status;
}

// Toggle password em auth
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
}
