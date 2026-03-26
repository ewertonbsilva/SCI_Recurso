import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Users, Building2, Filter, Download, Search, ChevronLeft, Clock, MapPin, UserCheck, X, FileDown } from 'lucide-react';
import { apiService } from '../apiService';
import { Turno, CadastroMilitar, CadastroCivil, Equipe, ChamadaMilitar, ChamadaCivil, FuncaoMilitar, UBMS, ORGAOS_ORIGEM } from '../types';
import jsPDF from 'jspdf';

interface RelatorioProps {
  onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
}

type RelatorioType = 'pessoal' | 'turno' | 'unidade' | null;
type PessoalType = 'militar' | 'civil';

// Componente Select Search
interface SelectSearchProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}

const SelectSearch: React.FC<SelectSearchProps> = ({ value, onChange, options, placeholder = "Selecione...", disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.select-search-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative select-search-container">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={selectedOption ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronLeft size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-90' : '-rotate-90'}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-hidden">
          <div className="p-2 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                autoFocus
              />
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value || option.label}
                  onClick={() => handleSelect(option.value)}
                  className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm text-slate-900 dark:text-white"
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-slate-400 dark:text-slate-500 text-sm text-center">
                Nenhum resultado encontrado
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Relatorios: React.FC<RelatorioProps> = ({ onNotify }) => {
  const [activeReport, setActiveReport] = useState<RelatorioType>(null);
  const [loading, setLoading] = useState(false);
  
  // Estados para Relatório Pessoal
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [pessoalType, setPessoalType] = useState<PessoalType>('militar');
  const [selectedMatricula, setSelectedMatricula] = useState('');
  const [selectedCivil, setSelectedCivil] = useState('');
  const [militares, setMilitares] = useState<CadastroMilitar[]>([]);
  const [civis, setCivis] = useState<CadastroCivil[]>([]);
  const [relatorioPessoal, setRelatorioPessoal] = useState<any[]>([]);

  // Estados para Relatório Turno
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [selectedTurno, setSelectedTurno] = useState('');
  const [relatorioTurno, setRelatorioTurno] = useState<any[]>([]);

  // Estados para Relatório Unidade
  const [selectedUBM, setSelectedUBM] = useState<string>('');
  const [selectedOrgao, setSelectedOrgao] = useState<string>('');
  const [orgaosOrigem, setOrgaosOrigem] = useState<string[]>([]);
  const [relatorioUnidade, setRelatorioUnidade] = useState<any[]>([]);

  useEffect(() => {
    carregarDadosBase();
  }, []);

  const carregarDadosBase = async () => {
    try {
      const [militaresRes, civisRes, turnosRes, orgaosRes] = await Promise.all([
        apiService.getMilitares(),
        apiService.getCivis(),
        apiService.getTurnos(),
        apiService.getOrgaosOrigem()
      ]);
      
      setMilitares(militaresRes);
      setCivis(civisRes);
      setTurnos(turnosRes);
      setOrgaosOrigem(orgaosRes.map((org: any) => org.nome_orgao));
    } catch (error) {
      console.error('Erro ao carregar dados base:', error);
      onNotify('Erro ao carregar dados base', 'error');
    }
  };

  const gerarRelatorioPessoal = async () => {
    if (!selectedMatricula && pessoalType === 'militar') {
      onNotify('Selecione um militar', 'error');
      return;
    }

    if (!selectedCivil && pessoalType === 'civil') {
      onNotify('Selecione um civil', 'error');
      return;
    }

    // Se datas não foram preenchidas, busca todo o período
    if (!dataInicio || !dataFim) {
      onNotify('Buscando todos os registros (datas não especificadas)', 'info');
    }

    setLoading(true);
    try {
      let response;
      
      if (pessoalType === 'militar') {
        response = await apiService.getRelatorioPessoalMilitar({
          matricula: selectedMatricula,
          dataInicio,
          dataFim
        });
      } else {
        response = await apiService.getRelatorioPessoalCivil({
          idCivil: selectedCivil,
          dataInicio,
          dataFim
        });
      }
      
      const dadosRelatorio = Array.isArray(response) ? response : response.data || [];
      setRelatorioPessoal(dadosRelatorio);
      onNotify('Relatório gerado com sucesso', 'success');
    } catch (error) {
      console.error('Erro ao gerar relatório pessoal:', error);
      onNotify('Erro ao gerar relatório', 'error');
    } finally {
      setLoading(false);
    }
  };

  const gerarRelatorioTurno = async () => {
    if (!selectedTurno) {
      onNotify('Selecione um turno', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.getRelatorioTurno(selectedTurno);
      setRelatorioTurno(response || []);
      onNotify('Relatório de turno gerado com sucesso', 'success');
    } catch (error) {
      console.error('Erro ao gerar relatório de turno:', error);
      onNotify('Erro ao gerar relatório de turno', 'error');
    } finally {
      setLoading(false);
    }
  };

  const gerarRelatorioUnidade = async () => {
    if (!selectedUBM && !selectedOrgao) {
      onNotify('Selecione uma UBM ou órgão', 'error');
      return;
    }

    // Se datas não foram preenchidas, busca todo o período
    if (!dataInicio || !dataFim) {
      onNotify('Buscando todos os registros (datas não especificadas)', 'info');
    }

    setLoading(true);
    try {
      let response;
      
      if (selectedUBM) {
        response = await apiService.getRelatorioUnidadeMilitar({
          ubm: selectedUBM,
          dataInicio: dataInicio || undefined,
          dataFim: dataFim || undefined
        });
      } else {
        response = await apiService.getRelatorioUnidadeCivil({
          orgao: selectedOrgao,
          dataInicio: dataInicio || undefined,
          dataFim: dataFim || undefined
        });
      }
      
      setRelatorioUnidade(response || []);
      onNotify('Relatório de unidade gerado com sucesso', 'success');
    } catch (error) {
      console.error('Erro ao gerar relatório de unidade:', error);
      onNotify('Erro ao gerar relatório de unidade', 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportarParaExcel = (dados: any[], nomeArquivo: string) => {
    // Simulação de exportação - na implementação real usaria uma biblioteca como xlsx
    const csvContent = dados.map(item => Object.values(item).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nomeArquivo}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    onNotify('Relatório exportado com sucesso', 'success');
  };

  const exportarParaPDF = (dados: any[], nomeArquivo: string, tipoRelatorio: string) => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Configurações de estilo
      const headerColor = [41, 128, 185]; // Azul
      const textColor = [44, 62, 80]; // Azul escuro
      const borderColor = [189, 195, 199]; // Cinza claro
      const accentColor = [52, 152, 219]; // Azul mais claro

      // Cabeçalho
      pdf.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SCI RECURSO', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Sistema de Controle de Internação de Recursos', pageWidth / 2, 30, { align: 'center' });
      
      // Título do relatório
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(nomeArquivo.toUpperCase(), 20, 55);
      
      // Data de geração
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth - 20, 55, { align: 'right' });
      
      // Linha decorativa
      pdf.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      pdf.setLineWidth(0.5);
      pdf.line(20, 65, pageWidth - 20, 65);
      
      yPosition = 75;

      // Conteúdo específico por tipo de relatório
      if (tipoRelatorio === 'pessoal') {
        const isMilitar = dados.length > 0 && dados[0].nome_posto_grad;
        
        if (isMilitar) {
          // Relatório Pessoal Militar
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Militar:', 20, yPosition);
          yPosition += 8;
          
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${dados[0].nome_posto_grad} ${dados[0].nome_guerra}`, 25, yPosition);
          yPosition += 8;
          
          // Coletar todas as funções únicas
          const funcoesUnicas = [...new Set(dados.map(item => item.funcao).filter(f => f))];
          const funcoesText = funcoesUnicas.length > 0 ? funcoesUnicas.join(', ') : 'Nenhuma';
          pdf.text(`Função(ões): ${funcoesText}`, 25, yPosition);
          yPosition += 8;
          pdf.text(`Total de Registros: ${dados.length}`, 25, yPosition);
          yPosition += 15;
          
          // Cabeçalho da tabela
          pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
          pdf.rect(20, yPosition, pageWidth - 40, 10, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Data', 25, yPosition + 7);
          pdf.text('Turno', 60, yPosition + 7);
          pdf.text('Equipe', 100, yPosition + 7);
          pdf.text('Função', 140, yPosition + 7);
          
          yPosition += 10;
          
          // Dados da tabela
          pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
          pdf.setFont('helvetica', 'normal');
          dados.forEach((item, index) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = 20;
              
              // Repetir cabeçalho
              pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
              pdf.rect(20, yPosition, pageWidth - 40, 10, 'F');
              pdf.setTextColor(255, 255, 255);
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'bold');
              pdf.text('Data', 25, yPosition + 7);
              pdf.text('Turno', 60, yPosition + 7);
              pdf.text('Equipe', 100, yPosition + 7);
              pdf.text('Função', 140, yPosition + 7);
              
              yPosition += 10;
              pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
              pdf.setFont('helvetica', 'normal');
            }
            
            // Linha separadora
            if (index > 0) {
              pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
              pdf.line(20, yPosition, pageWidth - 20, yPosition);
            }
            
            pdf.text(item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '-', 25, yPosition + 7);
            pdf.text(item.periodo || '-', 60, yPosition + 7);
            pdf.text(item.equipe || 'Base', 100, yPosition + 7);
            pdf.text(item.funcao || '-', 140, yPosition + 7);
            
            yPosition += 12;
          });
        } else {
          // Relatório Pessoal Civil
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Civil:', 20, yPosition);
          yPosition += 8;
          
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${dados[0].nome_completo || '-'}`, 25, yPosition);
          yPosition += 8;
          pdf.text(`Órgão: ${dados[0].nome_orgao || '-'}`, 25, yPosition);
          yPosition += 8;
          pdf.text(`Total de Registros: ${dados.length}`, 25, yPosition);
          yPosition += 15;
          
          // Cabeçalho da tabela
          pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
          pdf.rect(20, yPosition, pageWidth - 40, 10, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Data', 25, yPosition + 7);
          pdf.text('Turno', 60, yPosition + 7);
          pdf.text('Quantidade', 100, yPosition + 7);
          pdf.text('Saída', 140, yPosition + 7);
          pdf.text('Equipe', 170, yPosition + 7);
          
          yPosition += 10;
          
          // Dados da tabela
          pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
          pdf.setFont('helvetica', 'normal');
          dados.forEach((item, index) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = 20;
              
              // Repetir cabeçalho
              pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
              pdf.rect(20, yPosition, pageWidth - 40, 10, 'F');
              pdf.setTextColor(255, 255, 255);
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'bold');
              pdf.text('Data', 25, yPosition + 7);
              pdf.text('Turno', 60, yPosition + 7);
              pdf.text('Quantidade', 100, yPosition + 7);
              pdf.text('Saída', 140, yPosition + 7);
              pdf.text('Equipe', 170, yPosition + 7);
              
              yPosition += 10;
              pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
              pdf.setFont('helvetica', 'normal');
            }
            
            // Linha separadora
            if (index > 0) {
              pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
              pdf.line(20, yPosition, pageWidth - 20, yPosition);
            }
            
            pdf.text(item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '-', 25, yPosition + 7);
            pdf.text(item.periodo || '-', 60, yPosition + 7);
            pdf.text(item.quant_civil?.toString() || '-', 100, yPosition + 7);
            pdf.text(item.saida || '-', 140, yPosition + 7);
            pdf.text(item.equipe || 'Base', 170, yPosition + 7);
            
            yPosition += 12;
          });
        }
      } else if (tipoRelatorio === 'turno') {
        // Relatório de Turno
        const militares = dados.filter(r => r.tipo === 'militar');
        const civis = dados.filter(r => r.tipo === 'civil');
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Turno:', 20, yPosition);
        yPosition += 8;
        
        pdf.setFont('helvetica', 'normal');
        if (dados.length > 0) {
          // Tentar obter informações do turno de forma mais robusta
          const primeiroRegistro = dados[0];
          const dataTurno = primeiroRegistro.data ? new Date(primeiroRegistro.data).toLocaleDateString('pt-BR') : '-';
          const periodoTurno = primeiroRegistro.periodo || '-';
          pdf.text(`${dataTurno} - ${periodoTurno}`, 25, yPosition);
        } else {
          pdf.text('Informações do turno não disponíveis', 25, yPosition);
        }
        yPosition += 8;
        pdf.text(`Militares: ${militares.length} | Civis: ${civis.length}`, 25, yPosition);
        yPosition += 15;
        
        // Militares
        if (militares.length > 0) {
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text('MILITARES', 20, yPosition);
          yPosition += 10;
          
          // Cabeçalho
          pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
          pdf.rect(20, yPosition, pageWidth - 40, 10, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Posto/Grad', 25, yPosition + 7);
          pdf.text('Nome', 70, yPosition + 7);
          pdf.text('Unidade', 120, yPosition + 7);
          pdf.text('Função', 160, yPosition + 7);
          
          yPosition += 10;
          
          // Dados
          pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
          pdf.setFont('helvetica', 'normal');
          militares.forEach((item, index) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = 20;
              
              // Repetir cabeçalho
              pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
              pdf.rect(20, yPosition, pageWidth - 40, 10, 'F');
              pdf.setTextColor(255, 255, 255);
              pdf.setFontSize(9);
              pdf.setFont('helvetica', 'bold');
              pdf.text('Posto/Grad', 25, yPosition + 7);
              pdf.text('Nome', 70, yPosition + 7);
              pdf.text('Unidade', 120, yPosition + 7);
              pdf.text('Função', 160, yPosition + 7);
              
              yPosition += 10;
              pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
              pdf.setFont('helvetica', 'normal');
            }
            
            if (index > 0) {
              pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
              pdf.line(20, yPosition, pageWidth - 20, yPosition);
            }
            
            pdf.text(item.nome_posto_grad || '-', 25, yPosition + 7);
            pdf.text(item.nome_guerra || '-', 70, yPosition + 7);
            pdf.text(item.nome_ubm || '-', 120, yPosition + 7);
            pdf.text(item.funcao || '-', 160, yPosition + 7);
            
            yPosition += 10;
          });
          
          yPosition += 10;
        }
        
        // Civis
        if (civis.length > 0) {
          if (yPosition > pageHeight - 80) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text('CIVIS', 20, yPosition);
          yPosition += 10;
          
          // Cabeçalho
          pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
          pdf.rect(20, yPosition, pageWidth - 40, 10, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Nome', 25, yPosition + 7);
          pdf.text('Órgão', 80, yPosition + 7);
          pdf.text('Quantidade', 130, yPosition + 7);
          pdf.text('Saída', 160, yPosition + 7);
          
          yPosition += 10;
          
          // Dados
          pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
          pdf.setFont('helvetica', 'normal');
          civis.forEach((item, index) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = 20;
              
              // Repetir cabeçalho
              pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
              pdf.rect(20, yPosition, pageWidth - 40, 10, 'F');
              pdf.setTextColor(255, 255, 255);
              pdf.setFontSize(9);
              pdf.setFont('helvetica', 'bold');
              pdf.text('Nome', 25, yPosition + 7);
              pdf.text('Órgão', 80, yPosition + 7);
              pdf.text('Quantidade', 130, yPosition + 7);
              pdf.text('Saída', 160, yPosition + 7);
              
              yPosition += 10;
              pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
              pdf.setFont('helvetica', 'normal');
            }
            
            if (index > 0) {
              pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
              pdf.line(20, yPosition, pageWidth - 20, yPosition);
            }
            
            pdf.text(item.nome_completo || '-', 25, yPosition + 7);
            pdf.text(item.orgao || '-', 80, yPosition + 7);
            pdf.text(item.quant_civil?.toString() || '-', 130, yPosition + 7);
            pdf.text(item.saida || '-', 160, yPosition + 7);
            
            yPosition += 10;
          });
        }
      } else if (tipoRelatorio === 'unidade') {
        // Relatório de Unidade
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Unidade:', 20, yPosition);
        yPosition += 8;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Total de Pessoas: ${dados.length}`, 25, yPosition);
        yPosition += 15;
        
        // Cabeçalho da tabela
        pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        pdf.rect(20, yPosition, pageWidth - 40, 10, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Nome', 25, yPosition + 7);
        pdf.text('Posto/Grad', 70, yPosition + 7);
        pdf.text('Nome Guerra', 110, yPosition + 7);
        pdf.text('Total Pres.', 160, yPosition + 7);
        
        yPosition += 10;
        
        // Dados da tabela
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
        pdf.setFont('helvetica', 'normal');
        dados.forEach((item, index) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
            
            // Repetir cabeçalho
            pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
            pdf.rect(20, yPosition, pageWidth - 40, 10, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Nome', 25, yPosition + 7);
            pdf.text('Posto/Grad', 70, yPosition + 7);
            pdf.text('Nome Guerra', 110, yPosition + 7);
            pdf.text('Total Pres.', 160, yPosition + 7);
            
            yPosition += 10;
            pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
            pdf.setFont('helvetica', 'normal');
          }
          
          // Linha separadora
          if (index > 0) {
            pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
            pdf.line(20, yPosition, pageWidth - 20, yPosition);
          }
          
          // Truncar nome completo se for muito longo
          const nomeCompleto = item.nome_completo || '-';
          const maxNomeLength = 25;
          const truncatedNome = nomeCompleto.length > maxNomeLength ? nomeCompleto.substring(0, maxNomeLength) + '...' : nomeCompleto;
          
          pdf.text(truncatedNome, 25, yPosition + 7);
          pdf.text(item.nome_posto_grad || '-', 70, yPosition + 7);
          pdf.text(item.nome_guerra || '-', 110, yPosition + 7);
          pdf.text(item.total_presencas?.toString() || '-', 160, yPosition + 7);
          
          yPosition += 12;
        });
      }
      
      // Rodapé
      const totalPages = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        // Linha do rodapé
        pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        pdf.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
        
        // Texto do rodapé
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        pdf.text('SCI RECURSO - Sistema de Controle de Internação de Recursos', pageWidth / 2, pageHeight - 5, { align: 'center' });
      }
      
      // Salvar o PDF
      pdf.save(`${nomeArquivo.replace(/_/g, ' ')}_${new Date().toISOString().split('T')[0]}.pdf`);
      onNotify('Relatório PDF gerado com sucesso', 'success');
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      onNotify('Erro ao gerar relatório PDF', 'error');
    }
  };

  const renderMenuPrincipal = () => (
    <div className="w-full">
      <div className="mb-4">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Relatórios</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Selecione o tipo de relatório que deseja gerar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveReport('pessoal')}
          className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-lg transition-all duration-300 text-left hover:scale-[1.02]"
        >
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
            <UserCheck className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Relatório Pessoal</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gera relatório individual com histórico de presença
          </p>
        </button>

        <button
          onClick={() => setActiveReport('turno')}
          className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-lg transition-all duration-300 text-left hover:scale-[1.02]"
        >
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
            <Clock className="text-green-600 dark:text-green-400" size={20} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Relatório de Turno</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mostra militares e civis por turno específico
          </p>
        </button>

        <button
          onClick={() => setActiveReport('unidade')}
          className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-lg transition-all duration-300 text-left hover:scale-[1.02]"
        >
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
            <Building2 className="text-purple-600 dark:text-purple-400" size={20} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Relatório de Unidade</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Estatísticas de presença por unidade
          </p>
        </button>
      </div>
    </div>
  );

  const renderRelatorioPessoal = () => (
    <div className="w-full">
      <div className="mb-4">
        <button
          onClick={() => setActiveReport(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-2"
        >
          <ChevronLeft size={18} />
          Voltar
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Relatório Pessoal</h2>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tipo
            </label>
            <select
              value={pessoalType}
              onChange={(e) => setPessoalType(e.target.value as PessoalType)}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="militar">Militar</option>
              <option value="civil">Civil</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Data Início (opcional)
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Data Fim (opcional)
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {pessoalType === 'militar' ? 'Militar' : 'Civil'}
            </label>
            <SelectSearch
              value={pessoalType === 'militar' ? selectedMatricula : selectedCivil}
              onChange={(value) => pessoalType === 'militar' ? setSelectedMatricula(value) : setSelectedCivil(value)}
              options={pessoalType === 'militar' 
                ? militares.map(m => ({ value: m.matricula, label: `${m.nome_posto_grad} ${m.nome_guerra}` }))
                : civis.map(c => ({ value: c.id_civil, label: c.nome_completo }))
              }
              placeholder={`Selecione ${pessoalType === 'militar' ? 'um militar' : 'um civil'}...`}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={gerarRelatorioPessoal}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Filter size={18} />
            {loading ? 'Gerando...' : 'Gerar Relatório'}
          </button>

          {relatorioPessoal.length > 0 && (
            <>
              <button
                onClick={() => exportarParaExcel(relatorioPessoal, `relatorio_pessoal_${pessoalType}`)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={18} />
                Exportar Excel
              </button>
              <button
                onClick={() => exportarParaPDF(relatorioPessoal, `relatorio_pessoal_${pessoalType}`, 'pessoal')}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FileDown size={18} />
                Exportar PDF
              </button>
            </>
          )}
        </div>
      </div>

      {relatorioPessoal.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Resultados ({relatorioPessoal.length} registros)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Turno
                  </th>
                  {pessoalType === 'militar' ? (
                    <>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Posto/Grad
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Nome de Guerra
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Função
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Órgão
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Quantidade
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Saída
                      </th>
                    </>
                  )}
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Equipe
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {relatorioPessoal.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                      {item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                      {item.periodo || '-'}
                    </td>
                    {pessoalType === 'militar' ? (
                      <>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                          {item.nome_posto_grad || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                          {item.nome_guerra || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                          {item.funcao || '-'}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                          {item.nome_completo || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                          {item.nome_orgao || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                          {item.quant_civil || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                          {item.saida || '-'}
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                      {item.equipe || 'Base'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileText className="text-slate-400" size={24} />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
            Nenhum registro encontrado
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Não há registros de presença para {pessoalType === 'militar' ? 'o militar selecionado' : 'o civil selecionado'} no período especificado.
          </p>
        </div>
      )}
    </div>
  );

  const renderRelatorioTurno = () => (
    <div className="w-full">
      <div className="mb-4">
        <button
          onClick={() => setActiveReport(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-2"
        >
          <ChevronLeft size={18} />
          Voltar
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Relatório de Turno</h2>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Turno
            </label>
            <SelectSearch
              value={selectedTurno}
              onChange={(value) => setSelectedTurno(value)}
              options={turnos.map(t => ({ 
                value: t.id_turno, 
                label: `${new Date(t.data).toLocaleDateString('pt-BR')} - ${t.periodo}` 
              }))}
              placeholder="Selecione um turno..."
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={gerarRelatorioTurno}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Filter size={18} />
            {loading ? 'Gerando...' : 'Gerar Relatório'}
          </button>

          {relatorioTurno.length > 0 && (
            <>
              <button
                onClick={() => exportarParaExcel(relatorioTurno, 'relatorio_turno')}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={18} />
                Exportar Excel
              </button>
              <button
                onClick={() => exportarParaPDF(relatorioTurno, 'relatorio_turno', 'turno')}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FileDown size={18} />
                Exportar PDF
              </button>
            </>
          )}
        </div>
      </div>

      {relatorioTurno.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Militares ({relatorioTurno.filter(r => r.tipo === 'militar').length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Posto/Grad
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Nome de Guerra
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Unidade
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Função
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Equipe
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {relatorioTurno.filter(r => r.tipo === 'militar').map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                        {item.nome_posto_grad}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                        {item.nome_guerra}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                        {item.nome_ubm}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                        {item.funcao}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                        {item.equipe || 'Base'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Civis ({relatorioTurno.filter(r => r.tipo === 'civil').length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Órgão
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Quantidade
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Saída
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Equipe
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {relatorioTurno.filter(r => r.tipo === 'civil').map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                        {item.nome_completo}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                        {item.orgao}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                        {item.quant_civil}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                        {item.saida || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                        {item.equipe || 'Base'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderRelatorioUnidade = () => (
    <div className="w-full">
      <div className="mb-4">
        <button
          onClick={() => setActiveReport(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-2"
        >
          <ChevronLeft size={18} />
          Voltar
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Relatório de Unidade</h2>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Data Início (opcional)
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Data Fim (opcional)
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Unidade/Órgão
            </label>
            <SelectSearch
              value={selectedUBM || selectedOrgao}
              onChange={(value) => {
                setSelectedUBM('');
                setSelectedOrgao('');
                if (Object.values(UBMS).includes(value as UBMS)) {
                  setSelectedUBM(value);
                } else if (orgaosOrigem.includes(value)) {
                  setSelectedOrgao(value);
                }
              }}
              options={[
                { label: '--- UNIDADES MILITARES ---', value: '', disabled: true },
                ...Object.values(UBMS).map(ubm => ({ value: ubm, label: ubm, key: `ubm-${ubm}` })),
                { label: '--- ÓRGÃOS CIVIS ---', value: '', disabled: true },
                ...orgaosOrigem.map(orgao => ({ value: orgao, label: orgao, key: `orgao-${orgao}` }))
              ]}
              placeholder="Selecione uma UBM ou órgão..."
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={gerarRelatorioUnidade}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Filter size={18} />
            {loading ? 'Gerando...' : 'Gerar Relatório'}
          </button>

          {relatorioUnidade.length > 0 && (
            <>
              <button
                onClick={() => exportarParaExcel(relatorioUnidade, 'relatorio_unidade')}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={18} />
                Exportar Excel
              </button>
              <button
                onClick={() => exportarParaPDF(relatorioUnidade, 'relatorio_unidade', 'unidade')}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FileDown size={18} />
                Exportar PDF
              </button>
            </>
          )}
        </div>
      </div>

      {relatorioUnidade.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Resultados ({relatorioUnidade.length} pessoas)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Nome
                  </th>
                  {selectedUBM && (
                    <>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Posto/Grad
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Nome de Guerra
                      </th>
                    </>
                  )}
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total de Presenças
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {relatorioUnidade.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                      {item.nome_completo}
                    </td>
                    {selectedUBM && (
                      <>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                          {item.nome_posto_grad || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                          {item.nome_guerra || '-'}
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-lg font-semibold text-sm">
                        {item.total_presencas}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  if (!activeReport) {
    return renderMenuPrincipal();
  }

  switch (activeReport) {
    case 'pessoal':
      return renderRelatorioPessoal();
    case 'turno':
      return renderRelatorioTurno();
    case 'unidade':
      return renderRelatorioUnidade();
    default:
      return renderMenuPrincipal();
  }
};

export default Relatorios;
