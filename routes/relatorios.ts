import express from 'express';
import { getConnection } from '../db';

const router = express.Router();

// Relatório Pessoal Militar
router.get('/pessoal/militar', async (req, res) => {
  try {
    const { matricula, dataInicio, dataFim } = req.query;
    
    if (!matricula) {
      return res.status(400).json({ error: 'Parâmetro obrigatório: matricula' });
    }

    // Montar query dinâmica baseada na presença das datas
    let whereClause = 'cm.matricula = ? AND cm.presenca = 1';
    let queryParams = [matricula];
    
    if (dataInicio && dataFim) {
      whereClause += ' AND t.data BETWEEN ? AND ?';
      queryParams.push(dataInicio, dataFim);
    }

    const query = `
      SELECT 
        DATE(t.data) as data,
        t.periodo,
        m.nome_completo,
        m.nome_guerra,
        pg.nome_posto_grad,
        cm.funcao,
        cm.presenca,
        COALESCE(e.nome_equipe, 'Base') as equipe
      FROM chamada_militar cm
      INNER JOIN turnos t ON cm.id_turno = t.id_turno
      INNER JOIN militares m ON cm.matricula = m.matricula
      INNER JOIN posto_grad pg ON m.id_posto_grad = pg.id_posto_grad
      LEFT JOIN equipes e ON cm.id_chamada_militar = e.id_chamada_militar
      WHERE ${whereClause}
        AND m.nome_guerra IS NOT NULL
        AND m.nome_guerra != ''
        AND pg.nome_posto_grad IS NOT NULL
        AND pg.nome_posto_grad != ''
      ORDER BY t.data DESC, t.periodo
    `;

    const results = await getConnection().query(query, queryParams) as any[];
    
    // Se o resultado for um array de arrays (formato MySQL2), achatar
    let finalResults = results;
    if (results.length > 0 && Array.isArray(results[0])) {
      finalResults = results[0]; // Pega o primeiro array que contém os dados
    }
    
    res.json(finalResults);
  } catch (error) {
    console.error('Erro ao gerar relatório pessoal militar:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Relatório Pessoal Civil
router.get('/pessoal/civil', async (req, res) => {
  try {
    const { idCivil, dataInicio, dataFim } = req.query;
    
    if (!idCivil) {
      return res.status(400).json({ error: 'Parâmetro obrigatório: idCivil' });
    }

    // Montar query dinâmica baseada na presença das datas
    let whereClause = 'cc.id_civil = ?';
    let queryParams = [idCivil];
    
    if (dataInicio && dataFim) {
      whereClause += ' AND t.data BETWEEN ? AND ?';
      queryParams.push(dataInicio, dataFim);
    }

    const query = `
      SELECT 
        t.data,
        t.periodo,
        c.nome_completo,
        c.contato,
        oo.nome_orgao,
        cc.quant_civil,
        cc.saida,
        e.nome_equipe as equipe
      FROM chamada_civil cc
      INNER JOIN turnos t ON cc.id_turno = t.id_turno
      INNER JOIN civis c ON cc.id_civil = c.id_civil
      INNER JOIN orgaos_origem oo ON c.id_orgao_origem = oo.id_orgao_origem
      LEFT JOIN equipes e ON cc.id_chamada_civil = e.id_chamada_civil
      WHERE ${whereClause}
      ORDER BY t.data DESC, t.periodo
    `;

    const results = await getConnection().query(query, queryParams) as any[];
    
    // Se o resultado for um array de arrays (formato MySQL2), achatar
    let finalResults = results;
    if (results.length > 0 && Array.isArray(results[0])) {
      finalResults = results[0]; // Pega o primeiro array que contém os dados
    }
    
    res.json(finalResults);
  } catch (error) {
    console.error('Erro ao gerar relatório pessoal civil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Relatório de Turno
router.get('/turno/:idTurno', async (req, res) => {
  try {
    const { idTurno } = req.params;
    
    if (!idTurno) {
      return res.status(400).json({ error: 'Parâmetro obrigatório: idTurno' });
    }

    // Busca militares do turno
    const militaresQuery = `
      SELECT 
        'militar' as tipo,
        m.nome_completo,
        m.nome_guerra,
        m.id_ubm,
        u.nome_ubm,
        pg.nome_posto_grad,
        cm.funcao,
        e.nome_equipe as equipe
      FROM chamada_militar cm
      INNER JOIN turnos t ON cm.id_turno = t.id_turno
      INNER JOIN militares m ON cm.matricula = m.matricula
      INNER JOIN posto_grad pg ON m.id_posto_grad = pg.id_posto_grad
      LEFT JOIN ubms u ON m.id_ubm = u.id_ubm
      LEFT JOIN equipes e ON cm.id_chamada_militar = e.id_chamada_militar
      WHERE cm.id_turno = ? AND cm.presenca = 1
      ORDER BY pg.hierarquia DESC, m.nome_guerra
    `;

    // Busca civis do turno
    const civisQuery = `
      SELECT 
        'civil' as tipo,
        c.nome_completo,
        oo.nome_orgao as orgao,
        cc.quant_civil,
        cc.saida,
        e.nome_equipe as equipe
      FROM chamada_civil cc
      INNER JOIN turnos t ON cc.id_turno = t.id_turno
      INNER JOIN civis c ON cc.id_civil = c.id_civil
      INNER JOIN orgaos_origem oo ON c.id_orgao_origem = oo.id_orgao_origem
      LEFT JOIN equipes e ON cc.id_chamada_civil = e.id_chamada_civil
      WHERE cc.id_turno = ?
      ORDER BY c.nome_completo
    `;

    const [militares, civis] = await Promise.all([
      getConnection().query(militaresQuery, [idTurno]),
      getConnection().query(civisQuery, [idTurno])
    ]);
    
    // Tratar formato de array de arrays do MySQL2
    let finalMilitares = militares;
    let finalCivis = civis;
    
    if (militares.length > 0 && Array.isArray((militares as any)[0])) {
      finalMilitares = (militares as any)[0];
    }
    
    if (civis.length > 0 && Array.isArray((civis as any)[0])) {
      finalCivis = (civis as any)[0];
    }
    
    const results = [...finalMilitares, ...finalCivis];
    res.json(results);
  } catch (error) {
    console.error('Erro ao gerar relatório de turno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Relatório Unidade Militar
router.get('/unidade/militar', async (req, res) => {
  try {
    const { ubm, dataInicio, dataFim } = req.query;
    
    if (!ubm) {
      return res.status(400).json({ error: 'Parâmetro obrigatório: ubm' });
    }

    // Montar query dinâmica baseada na presença das datas
    let whereClause = 'u.nome_ubm = ? AND cm.presenca = 1';
    let queryParams = [ubm];
    
    if (dataInicio && dataFim) {
      whereClause += ' AND t.data BETWEEN ? AND ?';
      queryParams.push(dataInicio, dataFim);
    }

    const query = `
      SELECT 
        m.nome_completo,
        m.nome_guerra,
        pg.nome_posto_grad,
        COUNT(*) as total_presencas
      FROM chamada_militar cm
      INNER JOIN turnos t ON cm.id_turno = t.id_turno
      INNER JOIN militares m ON cm.matricula = m.matricula
      INNER JOIN posto_grad pg ON m.id_posto_grad = pg.id_posto_grad
      INNER JOIN ubms u ON m.id_ubm = u.id_ubm
      WHERE ${whereClause}
      GROUP BY m.matricula, m.nome_completo, m.nome_guerra, pg.nome_posto_grad
      ORDER BY pg.hierarquia DESC, m.nome_guerra
    `;

    const results = await getConnection().query(query, queryParams) as any[];
    
    // Se o resultado for um array de arrays (formato MySQL2), achatar
    let finalResults = results;
    if (results.length > 0 && Array.isArray(results[0])) {
      // O MySQL2 retorna: [dados, metadados] ou [metadados, dados]
      // Precisamos identificar qual array contém os dados reais
      if (!results[0] || results[0].length === 0) {
        // Primeiro array vazio → verifica o segundo
        if (results[1]?.[0] && typeof results[1][0] === 'object' && results[1][0].name) {
          // Segundo array tem metadados → não há dados no banco
          finalResults = []; // Retorna array vazio quando não há dados
        } else {
          // Segundo array tem dados reais
          finalResults = results[1];
        }
      } else if (results[0]?.[0] && typeof results[0][0] === 'object' && results[0][0].name) {
        // Se o primeiro array for de metadados (tem propriedades como name, type, etc), pega o segundo
        finalResults = results[1];
      } else {
        // Primeiro array contém dados, usa o primeiro array
        finalResults = results[0];
      }
    }
    
    res.json(finalResults);
  } catch (error) {
    console.error('Erro ao gerar relatório unidade militar:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Relatório Unidade Civil
router.get('/unidade/civil', async (req, res) => {
  try {
    const { orgao, dataInicio, dataFim } = req.query;
    
    if (!orgao) {
      return res.status(400).json({ error: 'Parâmetro obrigatório: orgao' });
    }

    // Montar query dinâmica baseada na presença das datas
    let whereClause = 'oo.nome_orgao = ?';
    let queryParams = [orgao];
    
    if (dataInicio && dataFim) {
      whereClause += ' AND t.data BETWEEN ? AND ?';
      queryParams.push(dataInicio, dataFim);
    }

    const query = `
      SELECT 
        c.nome_completo,
        oo.nome_orgao,
        COUNT(*) as total_presencas
      FROM chamada_civil cc
      INNER JOIN turnos t ON cc.id_turno = t.id_turno
      INNER JOIN civis c ON cc.id_civil = c.id_civil
      INNER JOIN orgaos_origem oo ON c.id_orgao_origem = oo.id_orgao_origem
      WHERE ${whereClause}
      GROUP BY c.id_civil, c.nome_completo, oo.nome_orgao
      ORDER BY c.nome_completo
    `;

    const results = await getConnection().query(query, queryParams) as any[];
    
    // Se o resultado for um array de arrays (formato MySQL2), achatar
    let finalResults = results;
    if (results.length > 0 && Array.isArray(results[0])) {
      // O MySQL2 retorna: [dados, metadados] ou [metadados, dados]
      // Precisamos identificar qual array contém os dados reais
      if (!results[0] || results[0].length === 0) {
        // Primeiro array vazio → verifica o segundo
        if (results[1]?.[0] && typeof results[1][0] === 'object' && results[1][0].name) {
          // Segundo array tem metadados → não há dados no banco
          finalResults = []; // Retorna array vazio quando não há dados
        } else {
          // Segundo array tem dados reais
          finalResults = results[1];
        }
      } else if (results[0]?.[0] && typeof results[0][0] === 'object' && results[0][0].name) {
        // Se o primeiro array for de metadados (tem propriedades como name, type, etc), pega o segundo
        finalResults = results[1];
      } else {
        // Primeiro array contém dados, usa o primeiro array
        finalResults = results[0];
      }
    }
    
    res.json(finalResults);
  } catch (error) {
    console.error('Erro ao gerar relatório unidade civil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
