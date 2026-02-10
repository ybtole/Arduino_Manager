// ===== TEMA (Dark/Light Mode) =====
const html = document.documentElement;
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);

// ===== FUNÇÕES DE AUTENTICAÇÃO =====

// Toggle visualização de senha
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const btn = input.nextElementSibling;

    if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = `
            <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
        `;
    } else {
        input.type = 'password';
        btn.innerHTML = `
            <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
    }
}

// Validação de senha forte
function validarSenhaForte(senha) {
    const requisitos = {
        tamanho: senha.length >= 8,
        maiuscula: /[A-Z]/.test(senha),
        minuscula: /[a-z]/.test(senha),
        numero: /[0-9]/.test(senha),
        especial: /[!@#$%&*]/.test(senha)
    };

    const pontos = Object.values(requisitos).filter(v => v).length;

    return {
        forte: pontos >= 4,
        requisitos: requisitos,
        pontos: pontos
    };
}

// Indicador visual de força da senha
function mostrarForcaSenha(inputId, containerId) {
    const input = document.getElementById(inputId);
    const container = document.getElementById(containerId);

    if (!container) return;

    input.addEventListener('input', () => {
        const resultado = validarSenhaForte(input.value);

        let cor = '#ef4444';
        let texto = 'Fraca';

        if (resultado.pontos >= 4) {
            cor = '#10b981';
            texto = 'Forte';
        } else if (resultado.pontos >= 3) {
            cor = '#f59e0b';
            texto = 'Média';
        }

        container.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                <div style="flex: 1; height: 4px; background: #e5e7eb; border-radius: 999px;">
                    <div style="width: ${resultado.pontos * 20}%; height: 100%; background: ${cor}; border-radius: 999px; transition: all 0.3s;"></div>
                </div>
                <span style="font-size: 0.75rem; color: ${cor}; font-weight: 600;">${texto}</span>
            </div>
        `;
    });
}
