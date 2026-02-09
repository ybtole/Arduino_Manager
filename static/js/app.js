// ===== CONFIGURAÇÕES GLOBAIS =====
const API_BASE = '';
let kitsData = [];

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
    carregarEstatisticas();
    carregarKits();
});

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
    } catch (error) {
        console.error('Erro ao carregar kits:', error);
    }
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
            </div>
        </div>
        
        <div style="margin: 2rem 0;">
            <h3 style="margin-bottom: 1rem;">📜 Histórico</h3>
            <div class="ai-card">
                ${historicoHTML}
            </div>
        </div>
        
        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
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
        </div>
    `;
    
    modal.classList.add('active');
}

function fecharModal() {
    const modal = document.getElementById('kitModal');
    modal.classList.remove('active');
}

// Fecha modal clicando fora
document.getElementById('kitModal').addEventListener('click', (e) => {
    if (e.target.id === 'kitModal') {
        fecharModal();
    }
});

async function mudarStatus(kitId, novoStatus) {
    const responsavel = prompt('Digite seu nome:');
    if (!responsavel) return;
    
    const observacao = prompt('Observação (opcional):') || '';
    
    try {
        const response = await fetch(`${API_BASE}/api/kit/${kitId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: novoStatus,
                responsavel: responsavel,
                observacao: observacao
            })
        });
        
        const result = await response.json();
        
        if (result.sucesso) {
            alert('Status atualizado com sucesso!');
            fecharModal();
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

// ===== FUNÇÕES AUXILIARES =====
function getComponentIcon(nome) {
    const icons = {
        'Arduino Uno R3': '🔧',
        'Arduino Mega 2560': '🔧',
        'Cabo USB': '🔌',
        'Protoboard': '📟',
        'LED': '💡',
        'Resistor': '🔴',
        'Jumper': '📎',
        'Push Button': '🔘',
        'Sensor Ultrassônico': '📡',
        'Sensor DHT11': '🌡️',
        'Display LCD': '📺',
        'Servo Motor': '⚙️',
        'Módulo WiFi': '📶',
        'Motor DC': '🔄',
        'Sensor de Gás': '💨',
        'Módulo RFID': '📱',
        'Matriz LED': '🔳',
        'Capacitor': '🔋'
    };
    
    for (const [key, icon] of Object.entries(icons)) {
        if (nome.includes(key) || nome.includes(key.toLowerCase())) {
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
