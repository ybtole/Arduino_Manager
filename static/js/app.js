const API_BASE = '';
let kitsData = [];
let currentUser = null;
let componentesSelecionados = [];
let currentHistoryPage = 0;
let historyItemsPerPage = 5;
let pendingStatusChange = null;

// Lista de Componentes Disponíveis
const COMPONENTES_DISPONIVEIS = [
    { nome: 'Arduino Uno R3', icon: '🔧' },
    { nome: 'Arduino Mega 2560', icon: '🔧' },
    { nome: 'Arduino Nano', icon: '🔧' },
    { nome: 'Placa de Ensaio (Protoboard)', icon: '📟' },
    { nome: 'Cabo USB A-B', icon: '🔌' },
    { nome: 'Jumpers Macho-Macho', icon: '📎' },
    { nome: 'Jumpers Macho-Fêmea', icon: '📎' },
    { nome: 'Jumpers variados', icon: '➰' },
    { nome: 'LED Vermelho', icon: '🔴' },
    { nome: 'LED Verde', icon: '🟢' },
    { nome: 'LED Amarelo', icon: '🟡' },
    { nome: 'Resistor', icon: '⚡', editavel: true },
    { nome: 'Potenciômetro', icon: '🎛️' },
    { nome: 'Push Button', icon: '🔘' },
    { nome: 'Sensor Ultrassônico HC-SR04', icon: '📡' },
    { nome: 'Sensor de Temperatura DHT11', icon: '🌡️' },
    { nome: 'Display LCD 16x2', icon: '📺' },
    { nome: 'Servo Motor SG90', icon: '⚙️' },
    { nome: 'Motor DC', icon: '🔄' },
    { nome: 'Buzzer Ativo', icon: '🔊' },
    { nome: 'Módulo Relé', icon: '🔌' },
    { nome: 'Outro Componente', icon: '📦', editavel: true }
];

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
                    <div class="btn-title">${kit.nome}</div>
                    <div class="btn-subtitle">${kit.id}</div>
                </div>
            </button>
        `;
    }).join('');
}

function renderizarKanban() {
    const statuses = ['em-uso', 'para-conferencia', 'organizado'];
    const ids = { 'em-uso': 'columnEmUso', 'para-conferencia': 'columnParaConferencia', 'organizado': 'columnOrganizado' };
    const counts = { 'em-uso': 'countEmUso', 'para-conferencia': 'countParaConferencia', 'organizado': 'countOrganizado' };

    statuses.forEach(status => {
        const kits = kitsData.filter(k => k.status === status);
        document.getElementById(counts[status]).textContent = kits.length;

        const visibleKits = kits.slice(0, 3);
        let html = visibleKits.map(criarKitCard).join('');

        if (kits.length > 3) {
            html += `
                <button class="btn-ver-todos" onclick="abrirModalVerTodos('${status}')">
                    🔍 Ver todos (${kits.length})
                </button>
            `;
        }

        document.getElementById(ids[status]).innerHTML = html;
    });
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
            showAlert('Ops!', 'Kit não encontrado!', '❌');
            return;
        }

        fecharModal('verTodosModal'); // Auto-close if coming from See All
        currentHistoryPage = 0; // Reset page
        mostrarModalKit(kit);
    } catch (error) {
        console.error('Erro ao carregar detalhes do kit:', error);
        showAlert('Erro', 'Não foi possível carregar os detalhes do kit.', '❌');
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
        let badgeFalta = '';

        if (comp.quantidade < comp.quantidade_esperada) {
            statusClass = 'warning';
            statusIcon = '⚠';
            if (comp.quantidade === 0 && comp.estado !== 'perdido' && comp.estado !== 'danificado') {
                badgeFalta = '<span class="badge-falta">⚠️ EM FALTA</span>';
            }
        }

        if (comp.estado === 'perdido') {
            statusClass = 'error';
            statusIcon = '✗';
        } else if (comp.estado === 'danificado') {
            statusClass = 'error';
            statusIcon = '✗';
        } else if (comp.estado === 'usado') {
            if (statusClass !== 'warning') statusClass = 'usado';
            statusIcon = '⚠️';
        }

        const icon = getComponentIcon(comp.nome, comp.icon);

        return `
            <div class="component-card ${statusClass}">
                <div class="component-icon">${icon}</div>
                <div class="component-name">${comp.nome} ${badgeFalta}</div>
                <div class="component-qty ${statusClass}">
                    ${comp.quantidade}/${comp.quantidade_esperada}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.5rem;">
                    ${statusIcon} ${traduzirEstado(comp.estado)}
                </div>
            </div>
        `;
    }).join('');

    // Ordena histórico por data (mais recente primeiro)
    const historicoOrdenado = kit.historico ? [...kit.historico].reverse() : [];

    // Renderiza
    modalBody.innerHTML = `
        <div style="margin: 1rem 0;">
            <h3 style="margin-bottom: 1rem;">📦 Componentes do Kit</h3>
            <div class="components-grid">
                ${componentesHTML}
            </div>
        </div>
        
        <div style="display: flex; gap: 1rem; margin: 2rem 0; flex-wrap: wrap; justify-content: center;">
            <button class="btn btn-success" onclick="confirmarStatusModal('${kit.id}', 'organizado')">
                <span class="icon">✅</span>
                Marcar como Organizado
            </button>
            <button class="btn btn-warning" onclick="confirmarStatusModal('${kit.id}', 'para-conferencia')">
                <span class="icon">⚠️</span>
                Enviar para Conferência
            </button>
            <button class="btn btn-primary" onclick="confirmarStatusModal('${kit.id}', 'em-uso')">
                <span class="icon">🔧</span>
                Marcar como Em Uso
            </button>
            <button class="btn btn-primary" onclick="editarKitAtual()">
                <span class="icon">✏️</span>
                Editar Kit
            </button>
            <button class="btn btn-danger" onclick="deletarKit('${kit.id}')">
                <span class="icon">🗑️</span>
                Deletar Kit
            </button>
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
            <div class="ai-card" id="historyContainer">
                <!-- Histórico carregado via JS -->
            </div>
            
            <div class="pagination-controls-container">
                <div class="pagination-controls">
                    <select id="historyPerPage" onchange="mudarItemsPorPagina(this.value)" class="pagination-select">
                        <option value="3">3 por página</option>
                        <option value="5" selected>5 por página</option>
                        <option value="10">10 por página</option>
                        <option value="20">20 por página</option>
                    </select>
                    
                    <button class="btn-secondary btn-sm" onclick="mudarPaginaHistorico(-1)" id="btnPrevHistory">⬅️ Anterior</button>
                    <span id="historyPageIndicator" style="align-self: center;">Página 1</span>
                    <button class="btn-secondary btn-sm" onclick="mudarPaginaHistorico(1)" id="btnNextHistory">Próxima ➡️</button>
                    
                    <div class="pagination-jump">
                        <input type="number" id="historyJumpTo" min="1" placeholder="Pág..." class="input-jump" style="width: 60px;">
                        <button class="btn-secondary btn-sm" onclick="irParaPaginaHistorico()">Ir</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="qr-code-container" style="margin-top: 3rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
            <h3 style="margin-bottom: 1rem;">📱 QR Code</h3>
            <img src="${kit.qr_code}" alt="QR Code ${kit.id}">
            <p style="margin-top: 1rem; font-weight: 600;">${kit.id}</p>
            <button class="btn-secondary" onclick="baixarQRCode('${kit.id}')">
                ⬇️ Baixar QR Code
            </button>
        </div>
    `;

    // Renderiza a primeira página do histórico
    window.currentKitHistorico = historicoOrdenado; // Guarda para paginação
    renderizarPaginaHistorico();

    modal.classList.add('active');
}

function renderizarPaginaHistorico() {
    const container = document.getElementById('historyContainer');
    const btnPrev = document.getElementById('btnPrevHistory');
    const btnNext = document.getElementById('btnNextHistory');
    const indicator = document.getElementById('historyPageIndicator');

    if (!window.currentKitHistorico || window.currentKitHistorico.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Nenhum histórico registrado</p>';
        btnPrev.style.display = 'none';
        btnNext.style.display = 'none';
        indicator.style.display = 'none';
        return;
    }

    const totalPages = Math.ceil(window.currentKitHistorico.length / historyItemsPerPage);

    // Validate page
    if (currentHistoryPage < 0) currentHistoryPage = 0;
    if (currentHistoryPage >= totalPages) currentHistoryPage = totalPages - 1;

    const start = currentHistoryPage * historyItemsPerPage;
    const end = start + historyItemsPerPage;
    const items = window.currentKitHistorico.slice(start, end);

    container.innerHTML = items.map(h => `
        <div class="ai-item">
            <div>
                <strong>${h.acao}</strong> - ${h.responsavel || 'Sistema'}<br>
                <small>${new Date(h.data).toLocaleString('pt-BR')}</small><br>
                ${h.observacao ? `<em>${h.observacao}</em>` : ''}
            </div>
        </div>
    `).join('');

    // Update controls
    indicator.textContent = `Página ${currentHistoryPage + 1} de ${totalPages}`;
    btnPrev.disabled = currentHistoryPage === 0;
    btnNext.disabled = currentHistoryPage === totalPages - 1;

    btnPrev.style.display = 'inline-block';
    btnNext.style.display = 'inline-block';
    indicator.style.display = 'inline-block';
}

function irParaPaginaEspecifica(page) {
    currentHistoryPage = page;
    renderizarPaginaHistorico();
}

function mudarPaginaHistorico(delta) {
    currentHistoryPage += delta;
    renderizarPaginaHistorico();
}

function mudarItemsPorPagina(val) {
    historyItemsPerPage = parseInt(val);
    currentHistoryPage = 0;
    renderizarPaginaHistorico();
}

function irParaPaginaHistorico() {
    const input = document.getElementById('historyJumpTo');
    const val = parseInt(input.value);
    if (val > 0) {
        currentHistoryPage = val - 1;
        renderizarPaginaHistorico();
        input.value = '';
    }
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

    // Hide emoji picker if open
    if (modalId === 'cadastroKitModal') {
        document.getElementById('emojiPicker').style.display = 'none';
        pendingEmojiIndex = null;
    }
}

// Fecha modal clicando fora
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});

function confirmarStatusModal(kitId, novoStatus) {
    pendingStatusChange = { kitId, novoStatus };
    document.getElementById('statusObservacao').value = '';

    const mapStatus = {
        'em-uso': '🔧 Em Uso',
        'para-conferencia': '⚠️ Para Conferência',
        'organizado': '✅ Organizado'
    };

    document.getElementById('statusConfirmMessage').textContent = `Deseja mudar o status para "${mapStatus[novoStatus]}"?`;
    document.getElementById('statusConfirmModal').classList.add('active');
}

async function confirmarMudancaStatus() {
    if (!pendingStatusChange) return;

    const obs = document.getElementById('statusObservacao').value;
    const { kitId, novoStatus } = pendingStatusChange;

    // Call original logic but passed arguments
    await executarMudancaStatus(kitId, novoStatus, obs);

    fecharModal('statusConfirmModal');
    pendingStatusChange = null;
}

async function executarMudancaStatus(kitId, novoStatus, observacao) {
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
            // Remove alert and use modal update or notification if desired
            // For now, just refresh
            fecharModal('kitModal');
            carregarEstatisticas();
            carregarKits();
        } else {
            showAlert('Erro', 'Erro ao atualizar status', '❌');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro', 'Erro ao conectar ao servidor', '❌');
    }
}

async function deletarKit(kitId) {
    const confirmado = await showConfirm(`Tem certeza que deseja deletar o kit ${kitId}? Esta ação não pode ser desfeita!`);
    if (!confirmado) return;

    try {
        const response = await fetch(`${API_BASE}/api/kit/${kitId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.sucesso) {
            showAlert('Sucesso', 'Kit deletado com sucesso!', '🗑️');
            fecharModal('kitModal');
            carregarEstatisticas();
            carregarKits();
        } else {
            showAlert('Erro', 'Não foi possível deletar o kit', '❌');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro', 'Erro ao conectar ao servidor', '❌');
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
// ===== CADASTRO E EDIÇÃO DE KIT =====
function abrirModalCadastroKit() {
    const modal = document.getElementById('cadastroKitModal');
    const form = document.getElementById('cadastroKitForm');

    // Reset form
    form.reset();
    document.getElementById('kitIdEditar').value = '';
    document.getElementById('btnCadastroText').textContent = 'Cadastrar Kit';
    document.querySelector('#cadastroKitModal h2').textContent = '➕ Cadastrar Novo Kit';

    // Reset componentes
    componentesSelecionados = [];
    renderizarGridSelecao();
    atualizarListaSelecionados();

    modal.classList.add('active');
}

function editarKitAtual() {
    const modalDetalhes = document.getElementById('kitModal');
    const kitId = document.getElementById('modalTitle').textContent.split(' - ')[0];
    const kit = kitsData.find(k => k.id === kitId);

    if (!kit) return;

    // Fecha modal de detalhes e abre de cadastro
    modalDetalhes.classList.remove('active');

    // Preenche dados
    document.getElementById('kitIdEditar').value = kit.id;
    document.getElementById('nomeKit').value = kit.nome;
    document.getElementById('btnCadastroText').textContent = 'Salvar Alterações';
    document.querySelector('#cadastroKitModal h2').textContent = '✏️ Editar Kit';

    // Carrega componentes
    componentesSelecionados = kit.componentes.map(c => ({
        nome: c.nome,
        customName: c.customName || (c.nome.startsWith('Resistor') || c.nome.startsWith('Outro') ? c.nome : null), // Tenta inferir se era custom
        quantidade: c.quantidade,
        quantidade_esperada: c.quantidade_esperada || c.quantidade,
        estado: c.estado || 'bom'
    }));

    renderizarGridSelecao();
    atualizarListaSelecionados();

    document.getElementById('cadastroKitModal').classList.add('active');
}

function renderizarGridSelecao() {
    const container = document.getElementById('componentSelectionGrid');
    container.innerHTML = COMPONENTES_DISPONIVEIS.map(comp => {
        const selecionado = componentesSelecionados.find(c => c.nome === comp.nome);
        const classeSelecionado = selecionado ? 'selected' : '';

        return `
            <div class="component-option ${classeSelecionado}" onclick="adicionarOuIncrementarComponente('${comp.nome}')">
                <div class="component-option-icon">${comp.icon}</div>
                <div class="component-option-name">${comp.nome}</div>
            </div>
        `;
    }).join('');
}

function adicionarOuIncrementarComponente(nome) {
    const index = componentesSelecionados.findIndex(c => c.nome === nome);
    const componenteDef = COMPONENTES_DISPONIVEIS.find(c => c.nome === nome);

    if (index >= 0) {
        // Toggle OFF: Remove se já estiver selecionado
        componentesSelecionados.splice(index, 1);
    } else {
        // Toggle ON: Adiciona
        componentesSelecionados.push({
            nome: nome,
            customName: componenteDef.editavel ? '' : null,
            quantidade: 1,
            quantidade_esperada: 1,
            estado: 'bom'
        });
    }

    renderizarGridSelecao();
    atualizarListaSelecionados();
}

function atualizarListaSelecionados() {
    const container = document.getElementById('selectedComponentsList');

    if (componentesSelecionados.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); font-size: 0.9rem;">Nenhum componente selecionado</p>';
        return;
    }

    container.innerHTML = componentesSelecionados.map((comp, index) => {
        const icon = comp.icon || getComponentIcon(comp.nome);

        const nomeDisplay = comp.customName !== null
            ? `<input type="text" class="input-nome-comp" placeholder="${comp.nome} (Especifique)" value="${comp.customName || ''}" onchange="atualizarNomeCustom(${index}, this.value)">`
            : `<strong>${comp.nome}</strong>`;

        return `
            <div class="componente-item">
                <div class="comp-info">
                    <span style="font-size: 1.5rem; cursor: pointer;" onclick="abrirEmojiPicker(event, ${index})" title="Mudar ícone">${icon}</span>
                    ${nomeDisplay}
                </div>
                
                <div class="comp-controls">
                    <div class="qty-control" title="Quantidade Atual / Esperada">
                        <span>Qtd:</span>
                        <input type="number" value="${comp.quantidade}" min="0" class="input-qty" onchange="atualizarQuantidade(${index}, this.value)">
                        <span>/</span>
                        <input type="number" value="${comp.quantidade_esperada || comp.quantidade}" min="1" class="input-qty" onchange="atualizarQtdEsperada(${index}, this.value)">
                    </div>

                    <select class="input-status" onchange="atualizarEstado(${index}, this.value)">
                        <option value="bom" ${comp.estado === 'bom' ? 'selected' : ''}>✅ Bom</option>
                        <option value="usado" ${comp.estado === 'usado' ? 'selected' : ''}>⚠️ Usado</option>
                        <option value="danificado" ${comp.estado === 'danificado' ? 'selected' : ''}>❌ Danificado</option>
                        <option value="perdido" ${comp.estado === 'perdido' ? 'selected' : ''}>❓ Perdido</option>
                    </select>
                    
                    <button type="button" class="btn-remover" onclick="removerComponente(${index})">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function atualizarNomeCustom(index, valor) {
    componentesSelecionados[index].customName = valor;
}

function atualizarQuantidade(index, valor) {
    if (valor < 0) valor = 0;
    componentesSelecionados[index].quantidade = parseInt(valor);
}

function atualizarQtdEsperada(index, valor) {
    if (valor < 1) valor = 1;
    componentesSelecionados[index].quantidade_esperada = parseInt(valor);
}



function atualizarEstado(index, estado) {
    componentesSelecionados[index].estado = estado;
}

function removerComponente(index) {
    componentesSelecionados.splice(index, 1);
    renderizarGridSelecao();
    atualizarListaSelecionados();
}

document.getElementById('cadastroKitForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btnText = document.getElementById('btnCadastroText');
    const btnLoader = document.getElementById('btnCadastroLoader');
    const kitId = document.getElementById('kitIdEditar').value;

    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';

    const nome = document.getElementById('nomeKit').value;

    if (componentesSelecionados.length === 0) {
        alert('Adicione pelo menos um componente!');
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        return;
    }

    // Prepara componentes
    const componentesFinais = componentesSelecionados.map(c => ({
        // Se tiver customName, usa ele como nome final ou concatena
        nome: c.customName ? c.customName : c.nome,
        customName: c.customName, // Salva para poder editar depois
        quantidade: c.quantidade,
        quantidade_esperada: c.quantidade_esperada || 1,
        estado: c.estado,
        imagem: ''
    }));

    try {
        const url = kitId ? `${API_BASE}/api/kit/${kitId}` : `${API_BASE}/api/kit`;
        const method = kitId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: nome,
                componentes: componentesFinais
            })
        });

        const result = await response.json();

        if (result.sucesso) {
            alert(`Kit ${kitId ? 'atualizado' : 'cadastrado'} com sucesso!`);
            fecharModal('cadastroKitModal');
            carregarEstatisticas();
            carregarKits();

            if (!kitId) {
                mostrarQRCode(result.kit);
            }
        } else {
            alert('Erro ao salvar kit: ' + (result.mensagem || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
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
function getComponentIcon(nome, icon) {
    if (icon) return icon;
    const icons = {
        'Arduino': '🔧',
        'Protoboard': '📟',
        'Placa de Ensaio': '📟',
        'Cabo USB': '🔌',
        'Jumper': '📎',
        'LED': '🔴',
        'Resistor': '⚡',
        'Potenciômetro': '🎛️',
        'Botão': '🔘',
        'Button': '🔘',
        'Sensor': '📡',
        'Ultrassônico': '📡',
        'Temperatura': '🌡️',
        'Display': '📺',
        'LCD': '📺',
        'Servo': '⚙️',
        'Motor': '🔄',
        'Buzzer': '🔊',
        'Capacitor': '🔋',
        'Bateria': '🔋',
        'Relé': '🔌',
        'Driver': '💿'
    };

    const compDisponivel = COMPONENTES_DISPONIVEIS.find(c => c.nome === nome);
    if (compDisponivel) return compDisponivel.icon;

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

function traduzirEstado(estado) {
    const map = {
        'bom': '✅ Bom',
        'usado': '⚠️ Usado',
        'danificado': '❌ Danificado',
        'perdido': '❓ Perdido'
    };
    return map[estado] || estado;
}

// ===== HELPER FUNCTIONS ROUND 3 =====
let pendingEmojiIndex = null;

function abrirEmojiPicker(event, index) {
    event.stopPropagation();
    const picker = document.getElementById('emojiPicker');
    pendingEmojiIndex = index;

    picker.style.display = 'block';
    picker.style.top = `${event.clientY}px`;
    picker.style.left = `${event.clientX}px`;
}

function selecionarEmoji(emoji) {
    if (pendingEmojiIndex !== null) {
        componentesSelecionados[pendingEmojiIndex].icon = emoji;
        atualizarListaSelecionados();
    }
    document.getElementById('emojiPicker').style.display = 'none';
    pendingEmojiIndex = null;
}

function abrirModalVerTodos(status) {
    const kits = kitsData.filter(k => k.status === status);
    const titleMap = { 'em-uso': '🔧 Em Uso', 'para-conferencia': '⚠️ Para Conferência', 'organizado': '✅ Organizado' };

    document.getElementById('verTodosTitle').textContent = `Kits: ${titleMap[status]}`;
    document.getElementById('verTodosGrid').innerHTML = kits.map(criarKitCard).join('');
    document.getElementById('verTodosModal').classList.add('active');
}

async function showAlert(title, message, icon = 'ℹ️') {
    document.getElementById('messageIcon').textContent = icon;
    document.getElementById('messageTitle').textContent = title;
    document.getElementById('messageBody').textContent = message;
    document.getElementById('messageModal').classList.add('active');
}

async function showConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('deleteConfirmModal');
        document.getElementById('deleteConfirmMessage').textContent = message;

        window.confirmarExclusaoKit = () => {
            fecharModal('deleteConfirmModal');
            resolve(true);
        };

        modal.classList.add('active');
    });
}

// Toggle password em auth
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
}

