// Configuração de dados eleitorais por tipo de cargo e estado
// Os valores podem variar por estado e tipo de cargo (federal/estadual)

export const ELECTORAL_DATA = {
  federal: {
    // Valores padrão para Deputado Federal (usado quando estado não está especificado)
    default: {
      quocienteEleitoral: 352120,
      clausulaBarreira: 0,
      vagasTotais: 71,
      vagasMulheres: 21,
    },
    // Valores específicos por estado para Deputado Federal
    SP: {
      quocienteEleitoral: 352120,
      clausulaBarreira: 0,
      vagasTotais: 71,
      vagasMulheres: 21,
    },
    // Adicione outros estados conforme necessário
    // RJ: { quocienteEleitoral: 280000, ... },
  },
  estadual: {
    // Valores padrão para Deputado Estadual
    default: {
      quocienteEleitoral: 240827,
      clausulaBarreira: 0,
      vagasTotais: 94,
      vagasMulheres: 28,
    },
    // Valores específicos por estado para Deputado Estadual
    SP: {
      quocienteEleitoral: 240827,
      clausulaBarreira: 0,
      vagasTotais: 94,
      vagasMulheres: 28,
    },
    // Adicione outros estados conforme necessário
    // RJ: { quocienteEleitoral: 650000, ... },
  },
};

/**
 * Função helper para buscar dados eleitorais baseado no tipo de cargo e estado
 * @param {string} tipoCargo - 'federal' ou 'estadual'
 * @param {string|null} estado - Sigla do estado (ex: 'SP', 'RJ') ou null
 * @returns {Object} Objeto com os dados eleitorais
 */
export const getElectoralData = (tipoCargo, estado) => {
  // Normaliza o tipo de cargo (padrão: estadual)
  const tipo = tipoCargo === 'federal' ? 'federal' : 'estadual';
  const tipoData = ELECTORAL_DATA[tipo] || ELECTORAL_DATA.estadual;
  
  // Se estado for fornecido e existir dados específicos, usa eles; senão usa default
  if (estado && tipoData[estado]) {
    return tipoData[estado];
  }
  
  return tipoData.default || ELECTORAL_DATA.estadual.default;
};

/**
 * Formata o quociente eleitoral para exibição (com separador de milhar)
 * @param {number} quociente - Valor numérico do quociente
 * @returns {string} Valor formatado (ex: "352.120")
 */
export const formatQuociente = (quociente) => {
  if (quociente === null || quociente === undefined) return '000.000';
  return quociente.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
