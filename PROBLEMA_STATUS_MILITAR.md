# PROBLEMA: STATUS DE MILITAR SENDO ALTERADO DE AUSENTE PARA PRESENTE

## DESCRIÇÃO DO PROBLEMA

Ao adicionar um militar na escala do turno, o sistema está salvando o status como **PRESENTE** mesmo quando o frontend envia **AUSENTE**.

## FLUXO ESPERADO

1. Usuário seleciona militar(es) na aba "Escalar Militar"
2. Clica em "Confirmar" 
3. Modal abre para escolher função (SCI/Combatente)
4. Usuário confirma
5. Frontend envia: `"presenca": "AUSENTE"`
6. Backend deveria salvar: `"presenca": "AUSENTE"`
7. Usuário vai na aba "Chamada" para alterar status manualmente

## FLUXO REAL (COM PROBLEMA)

1. ✅ Usuário seleciona militar(es) na aba "Escalar Militar"
2. ✅ Clica em "Confirmar"
3. ✅ Modal abre para escolher função (SCI/Combatente)
4. ✅ Usuário confirma
5. ✅ Frontend envia: `"presenca": "AUSENTE"`
6. ❌ Backend salva: `"presenca": "PRESENTE"` (PROBLEMA AQUI)
7. ✅ Usuário vai na aba "Chamada" para alterar status manualmente

## EVIDÊNCIAS

### Frontend (CORRETO)
```javascript
const newEntries = pendingSelection.map(matricula => ({
  id_chamada_militar: crypto.randomUUID(),
  id_turno,
  matricula,
  funcao: selectedFuncao,
  presenca: StatusPresenca.AUSENTE // <- ENVIANDO AUSENTE
}));
```

### Console do Frontend
```
Enviando militares para API: [{
  id_chamada_militar: "35946b75-9cd3-49e9-80bb-dea51ad5d839",
  id_turno: "0e5bc020-23bd-11f1-8bdd-02b959b4417d", 
  matricula: "3452531",
  funcao: "Combatente",
  presenca: "AUSENTE" // <- CORRETO
}]
```

### Banco de Dados (ERRADO)
```json
{
  "id_chamada_militar": "35946b75-9cd3-49e9-80bb-dea51ad5d839",
  "id_turno": "0e5bc020-23bd-11f1-8bdd-02b959b4417d",
  "matricula": "3452531", 
  "funcao": "Combatente",
  "presenca": "PRESENTE", // <- ERRADO! Deveria ser AUSENTE
  "obs": null,
  "created_at": "2026-03-20 13:08:31",
  "updated_at": "2026-03-20 13:08:31"
}
```

### Estrutura da Tabela (CORRETA)
```sql
CREATE TABLE `chamada_militar` (
  ...
  `presenca` ENUM('PRESENTE','AUSENTE','PERMUTA','ATESTADO') NULL DEFAULT 'AUSENTE'
  ...
);
```

## ANÁLISE

### ✅ O que está CORRETO:
1. **Frontend** está enviando `"presenca": "AUSENTE"` corretamente
2. **Estrutura da tabela** tem `DEFAULT 'AUSENTE'` corretamente
3. **API** está recebendo e repassando os dados corretamente

### ❌ O que está ERRADO:
1. **Backend** está alterando o status de AUSENTE para PRESENTE durante o salvamento

## POSSÍVEIS CAUSAS NO BACKEND

### 1. Controller/Route (MAIS PROVÁVEL)
```javascript
// Arquivo: routes/chamada-militar.js ou controllers/chamadaController.js
app.post('/api/chamada-militar', async (req, res) => {
  try {
    const chamada = await ChamadaMilitar.create({
      ...req.body,
      presenca: 'PRESENTE' // <- PROBLEMA AQUI - FORÇANDO PRESENTE
    });
    res.json(chamada);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 2. Middleware
```javascript
// Middleware que altera dados antes de chegar no controller
app.use((req, res, next) => {
  if (req.path === '/api/chamada-militar' && req.method === 'POST') {
    req.body.presenca = 'PRESENTE'; // <- PROBLEMA AQUI
  }
  next();
});
```

### 3. Hook/Callback do Sequelize
```javascript
// Arquivo: models/ChamadaMilitar.js
ChamadaMilitar.beforeCreate((chamada) => {
  chamada.presenca = 'PRESENTE'; // <- PROBLEMA AQUI
});

ChamadaMilitar.beforeValidate((chamada) => {
  if (!chamada.presenca) {
    chamada.presenca = 'PRESENTE'; // <- PROBLEMA AQUI
  }
});
```

### 4. Trigger no Banco de Dados
```sql
-- Trigger que força PRESENTE antes de inserir
CREATE TRIGGER force_presenca_presente
BEFORE INSERT ON chamada_militar
FOR EACH ROW
BEGIN
  SET NEW.presenca = 'PRESENTE'; -- <- PROBLEMA AQUI
END;
```

## SOLUÇÃO NECESSÁRIA

### Passo 1: Localizar o Problema
Procurar nos arquivos do backend:
1. **Routes**: `POST /api/chamada-militar`
2. **Controllers**: Função que cria chamada militar
3. **Models**: Hooks do Sequelize na model ChamadaMilitar
4. **Database**: Triggers na tabela chamada_militar

### Passo 2: Corrigir o Código
Remover qualquer código que esteja forçando `presenca = 'PRESENTE'` e permitir que o valor enviado pelo frontend seja respeitado.

### Passo 3: Testar
1. Adicionar militar novo
2. Verificar se status fica como AUSENTE no banco
3. Confirmar que pode ser alterado na aba "Chamada"

## IMPACTO ATUAL

- ✅ Sistema continua funcionando
- ❌ Militares novos aparecem como PRESENTE em vez de AUSENTE
- ✅ Status pode ser corrigido manualmente na aba "Chamada"
- ❌ Processo incorreto pode causar confusão nos relatórios

## RECOMENDAÇÕES

1. **IMEDIATO**: Corrigir o backend para respeitar o valor enviado pelo frontend
2. **CURTO PRAZO**: Adicionar validação para garantir que apenas valores válidos sejam aceitos
3. **LONGO PRAZO**: Implementar logging para rastrear alterações de status

---

**Data**: 20/03/2026  
**Status**: Aguardando correção no backend  
**Prioridade**: Alta - Impacta fluxo correto do sistema
