// Script para limpar todos os dados mockados do localStorage
// Execute este comando no console do navegador

console.log('Limpando dados mockados do localStorage...');

// Remove todos os dados da aplicação
localStorage.removeItem('sci_recurso_data_v1');
localStorage.removeItem('sci_session_v1');

// Verifica se os dados foram removidos
const dataExists = localStorage.getItem('sci_recurso_data_v1');
const sessionExists = localStorage.getItem('sci_session_v1');

if (!dataExists && !sessionExists) {
    console.log('✅ Todos os dados mockados foram removidos com sucesso!');
    console.log('📊 Dados removidos:');
    console.log('  - sci_recurso_data_v1 (dados da aplicação)');
    console.log('  - sci_session_v1 (sessão do usuário)');
    console.log('🔄 Recarregue a página para ver os dados padrão');
} else {
    console.log('❌ Alguns dados não puderam ser removidos');
}

// Mostra o que ainda existe no localStorage (se algo)
console.log('📋 Itens restantes no localStorage:');
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('sci') || key.includes('recurso'))) {
        console.log(`  - ${key}`);
    }
}
