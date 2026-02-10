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
        btn.classList.add('visible');
    } else {
        input.type = 'password';
        btn.classList.remove('visible');
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
