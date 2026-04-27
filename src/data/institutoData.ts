export interface Laboratory {
    id: string;
    nome: string;
    description: string;
    website?: string;
}

export interface Researcher {
    id: string;
    nome: string;
    avatar?: string;
    lattes?: string;
    role: string;
    iniciais: string;
}

export interface WinningPost {
    id: string;
    postId: string;
    title: string;
    mediaUrl: string;
    autor: string;
    categoria: string;
    ano: string;
    iniciais: string;
}

export interface Department {
    id: string;
    slug: string;
    sigla: string;
    nome: string;
    descricao: string;
    laboratorios: Laboratory[];
    pesquisadores: Researcher[];
    linhasPesquisa: string[];
    postsGanhadores: WinningPost[];
}

export const institutoData: Record<string, Department> = {
    "fap": {
        id: "d1000000-0000-0000-0000-000000000000",
        slug: "fap",
        sigla: "FAP",
        nome: "Física Aplicada",
        descricao: "O Departamento de Física Aplicada (FAP) dedica-se ao desenvolvimento de tecnologias baseadas em fenômenos físicos. Suas linhas de pesquisa abrangem desde a ciência dos materiais e nanotecnologia até a física médica e dosimetria das radiações.",
        laboratorios: [
            { id: "lab-cristal", nome: "Laboratório de Cristalografia", description: "Estudo da estrutura atômica e molecular de materiais cristalinos através da técnica de difração de raios-X." },
            { id: "lab-filmes", nome: "Laboratório de Filmes Finos", description: "Crescimento e caracterização de filmes binários e semicondutores para eletrônica mole." },
            { id: "lab-materiais", nome: "LAM - Laboratório de Análise de Materiais", description: "Análise multi-escala de materiais condensados e caracterização de superfícies." }
        ],
        pesquisadores: [
            { id: "sergio-morelhao", nome: "Sergio Luiz Morelhão", role: "Docente", iniciais: "SM", lattes: "http://lattes.cnpq.br/" },
            { id: "luciana-rizzo", nome: "Luciana Varanda Rizzo", role: "Docente", iniciais: "LR", lattes: "http://lattes.cnpq.br/" }
        ],
        linhasPesquisa: [
            "Análise de Materiais por Feixes Iônicos",
            "Ensino e Aprendizagem de Ciências",
            "Cristalografia",
            "Dispositivos Ultrassônicos",
            "Filmes Finos",
            "Física Atmosférica",
            "Física de Plasmas e Controle de Oscilações",
            "Física de Sistemas Biológicos"
        ],
        postsGanhadores: [
            { 
                id: "win-1", 
                postId: "post-1", 
                title: "Simulação de Difração em Cristais de Proteínas", 
                mediaUrl: "https://images.unsplash.com/photo-1532187863486-abf9d39d99c3?auto=format&fit=crop&q=80&w=800",
                autor: "Sergio Luiz Morelhão", 
                categoria: "Melhor Visualização Científica", 
                ano: "2024.2", 
                iniciais: "SM" 
            },
            { 
                id: "win-2", 
                postId: "post-2", 
                title: "Dinâmica de Aerossóis na Amazônia Central", 
                mediaUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800",
                autor: "Luciana Varanda Rizzo", 
                categoria: "Impacto Socioambiental", 
                ano: "2024.2", 
                iniciais: "LR" 
            }
        ]
    },
    "fmt": {
        id: "d2000000-0000-0000-0000-000000000000",
        slug: "fmt",
        sigla: "FMT",
        nome: "Física dos Materiais e Mecânica",
        descricao: "O Departamento de Física dos Materiais e Mecânica (FMT) destaca-se pela sua atuação em programas de pesquisa teórica e experimental, abordando áreas na fronteira do conhecimento da física da matéria condensada. O principal objetivo é investigar e compreender as propriedades fundamentais dos materiais no estado sólido, incluindo em nanoestruturas e biomoléculas.",
        laboratorios: [
            { id: "lesbt", nome: "LESBT - Lab. de Estado Sólido e Baixas Temperaturas", description: "Estudos de propriedades magnéticas e de transporte em baixas temperaturas e altos campos magnéticos." },
            { id: "lmm-em", nome: "LMM&EM - Lab. de Materiais Magnéticos e Espectroscopia Mössbauer", description: "Pesquisa em materiais magnéticos e utilização da espectroscopia Mössbauer para caracterização estrutural e magnética." },
            { id: "lnms", nome: "LNMS - Lab. de Novos Materiais Semicondutores", description: "Crescimento epitaxial e estudo de propriedades eletrônicas e ópticas de semicondutores nanoestruturados." },
            { id: "lts", nome: "Lab. de Transições de Fase e Supercondutividade", description: "Investigação de supercondutividade e transições de fase líquida-sólida em novos materiais." },
            { id: "lm-enl", nome: "Lab. de Magneto-Óptica e Espectroscopia Não-Linear", description: "Estudos de interação da luz com a matéria sob campos magnéticos intensos." },
            { id: "lna", nome: "Lab. de Nanomateriais e Aplicações", description: "Síntese e caracterização de nanomateriais para aplicações tecnológicas e biológicas." },
            { id: "gtm", nome: "Grupo Teórico de Materiais", description: "Modelagem computacional e cálculos de primeiros princípios de propriedades de materiais." },
            { id: "gsec", nome: "Grupo de Sistemas Eletrônicos Correlacionados", description: "Teoria de sistemas com fortes correlações eletrônicas e fenômenos emergentes." }
        ],
        pesquisadores: [
            { id: "valmir-chitta", nome: "Valmir Antonio Chitta", role: "Docente", iniciais: "VC", lattes: "http://lattes.cnpq.br/" },
            { id: "rafael-freitas", nome: "Rafael Sá de Freitas", role: "Docente", iniciais: "RF", lattes: "http://lattes.cnpq.br/" },
            { id: "armando-paduan", nome: "Armando Paduan Filho", role: "Docente Sênior", iniciais: "AP", lattes: "http://lattes.cnpq.br/" },
            { id: "nei-fernandes", nome: "Nei Fernandes de Oliveira Junior", role: "Docente Sênior", iniciais: "NO", lattes: "http://lattes.cnpq.br/" },
            { id: "antonio-santos", nome: "Antonio Domingues dos Santos", role: "Docente", iniciais: "AS", lattes: "http://lattes.cnpq.br/" },
            { id: "daniel-cornejo", nome: "Daniel Reinaldo Cornejo", role: "Docente", iniciais: "DC", lattes: "http://lattes.cnpq.br/" },
            { id: "luis-nagamine", nome: "Luis Carlos Camargo Miranda Nagamine", role: "Docente", iniciais: "LN", lattes: "http://lattes.cnpq.br/" },
            { id: "gennady-gusev", nome: "Gennady Gusev", role: "Docente", iniciais: "GG", lattes: "http://lattes.cnpq.br/" },
            { id: "alain-quivy", nome: "Alain André Quivy", role: "Docente", iniciais: "AQ", lattes: "http://lattes.cnpq.br/" },
            { id: "euzi-silva", nome: "Euzi Conceição Fernandes da Silva", role: "Docente", iniciais: "ES", lattes: "http://lattes.cnpq.br/" },
            { id: "felix-hernandez", nome: "Félix Guillermo Gonzalez Hernandez", role: "Docente", iniciais: "FH", lattes: "http://lattes.cnpq.br/" },
            { id: "alexandre-levine", nome: "Alexandre Levine", role: "Docente", iniciais: "AL", lattes: "http://lattes.cnpq.br/" },
            { id: "germano-penello", nome: "Germano Maioli Penello", role: "Docente", iniciais: "GP", lattes: "http://lattes.cnpq.br/" },
            { id: "renato-jardim", nome: "Renato de Figueiredo Jardim", role: "Docente", iniciais: "RJ", lattes: "http://lattes.cnpq.br/" },
            { id: "andre-henriques", nome: "André Bohomoletz Henriques", role: "Docente", iniciais: "AH", lattes: "http://lattes.cnpq.br/" },
            { id: "danilo-mustafa", nome: "Danilo Mustafa", role: "Docente", iniciais: "DM", lattes: "http://lattes.cnpq.br/" },
            { id: "marilia-caldas", nome: "Marília Junqueira Caldas", role: "Docente Sênior", iniciais: "MC", lattes: "http://lattes.cnpq.br/" },
            { id: "antonio-roque", nome: "Antônio José Roque da Silva", role: "Docente", iniciais: "AS", lattes: "http://lattes.cnpq.br/" },
            { id: "helena-petrilli", nome: "Helena Maria Petrilli", role: "Docente", iniciais: "HP", lattes: "http://lattes.cnpq.br/" },
            { id: "gustavo-dalpian", nome: "Gustavo Martini Dalpian", role: "Docente", iniciais: "GD", lattes: "http://lattes.cnpq.br/" },
            { id: "lucy-assali", nome: "Lucy Vitória Credidio Assali", role: "Docente", iniciais: "LA", lattes: "http://lattes.cnpq.br/" },
            { id: "caetano-miranda", nome: "Caetano Rodrigues Miranda", role: "Docente", iniciais: "CM", lattes: "http://lattes.cnpq.br/" },
            { id: "luana-pedroza", nome: "Luana Sucupira Pedroza", role: "Docente", iniciais: "LP", lattes: "http://lattes.cnpq.br/" },
            { id: "eric-andrade", nome: "Eric de Castro e Andrade", role: "Docente", iniciais: "EA", lattes: "http://lattes.cnpq.br/" },
            { id: "luis-dias", nome: "Luís Gregório Godoy Dias da Silva", role: "Docente", iniciais: "LD", lattes: "http://lattes.cnpq.br/" }
        ],
        linhasPesquisa: [
            "Propriedades Magnéticas em Baixas Temperaturas",
            "Sistemas Eletrônicos Correlacionados",
            "Semicondutores Nanoestruturados",
            "Supercondutores e Materiais Cerâmicos",
            "Magneto-Óptica e Espectroscopia",
            "Nanomateriais e Aplicações Biológicas",
            "Modelagem Computacional de Materiais",
            "Biofísica Molecular"
        ],
        postsGanhadores: [
            { 
                id: "win-fmt-1", 
                postId: "post-fmt-1", 
                title: "Descoberta de Novo Supercondutor de Alta Temperatura", 
                mediaUrl: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=800",
                autor: "Renato de Figueiredo Jardim", 
                categoria: "Pesquisa de Vanguarda", 
                ano: "2024.2", 
                iniciais: "RJ" 
            },
            { 
                id: "win-fmt-2", 
                postId: "post-fmt-2", 
                title: "Magneto-Óptica em Semicondutores Magnéticos Diluídos", 
                mediaUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
                autor: "André Bohomoletz Henriques", 
                categoria: "Excelência Experimental", 
                ano: "2024.1", 
                iniciais: "AH" 
            }
        ]
    },
    "fep": {
        id: "d3000000-0000-0000-0000-000000000000",
        slug: "fep",
        sigla: "FEP",
        nome: "Física Experimental",
        descricao: "O Departamento de Física Experimental (FEP) realiza experimentos de fronteira em física de partículas, astropartículas, óptica quântica e física nuclear, operando grandes infraestruturas de pesquisa e colaborações internacionais.",
        laboratorios: [
            { id: "lal", nome: "LAL - Laboratório do Acelerador Linear", description: "Pesquisa em física nuclear e aceleradores de partículas utilizando feixes de elétrons." },
            { id: "lmcal", nome: "LMCAL - Lab. de Manipulação Coerente de Átomos e Luz", description: "Estudo de interação luz-matéria, condensados de Bose-Einstein e óptica quântica." },
            { id: "grenac", nome: "GRENAC - Grupo de Reações Nucleares, Aplicações e Computação", description: "Pesquisa básico e aplicada em física nuclear e simulações computacionais de alto desempenho." },
            { id: "gfcx", nome: "GfCx - Grupo de Fluidos Complexos", description: "Estudo de sistemas de matéria mole, como cristais líquidos, coloides e membranas biológicas." },
            { id: "qmec", nome: "Laboratory for Quantum Matter under Extreme Conditions", description: "Investigação de propriedades quânticas da matéria sob pressões e temperaturas extremas." },
            { id: "cepa", nome: "CEPA - Centro de Ensino e Pesquisa Aplicada", description: "Desenvolvimento de novos métodos e tecnologias para o ensino de física." }
        ],
        pesquisadores: [
            { id: "ayrton-deppman", nome: "Ayrton Deppman", role: "Docente", iniciais: "AD", lattes: "http://lattes.cnpq.br/" },
            { id: "alessio-mangiarotti", nome: "Alessio Mangiarotti", role: "Docente", iniciais: "AM", lattes: "http://lattes.cnpq.br/" },
            { id: "antonio-figueiredo", nome: "Antonio Martins Figueiredo Neto", role: "Docente", iniciais: "AF", lattes: "http://lattes.cnpq.br/" },
            { id: "arnaldo-gammal", nome: "Arnaldo Gammal", role: "Docente", iniciais: "AG", lattes: "http://lattes.cnpq.br/" },
            { id: "cristiano-oliveira", nome: "Cristiano Luis Pinto de Oliveira", role: "Docente", iniciais: "CO", lattes: "http://lattes.cnpq.br/" },
            { id: "cristina-leite", nome: "Cristina Leite", role: "Docente", iniciais: "CL", lattes: "http://lattes.cnpq.br/" },
            { id: "edwaldo-santos", nome: "Edwaldo Moura Santos", role: "Docente", iniciais: "ES", lattes: "http://lattes.cnpq.br/" },
            { id: "ewout-haar", nome: "Ewout ter Haar", role: "Docente", iniciais: "EH", lattes: "http://lattes.cnpq.br/" },
            { id: "fernando-brandt", nome: "Fernando Tadeu Caldeira Brandt", role: "Docente", iniciais: "FB", lattes: "http://lattes.cnpq.br/" },
            { id: "ivone-albuquerque", nome: "Ivone Freire da Mota e Albuquerque", role: "Docente", iniciais: "IA", lattes: "http://lattes.cnpq.br/" },
            { id: "julio-jimenez", nome: "Julio Antonio Larrea Jimenez", role: "Docente", iniciais: "JJ", lattes: "http://lattes.cnpq.br/" },
            { id: "marcelo-martinelli", nome: "Marcelo Martinelli", role: "Docente", iniciais: "MM", lattes: "http://lattes.cnpq.br/" },
            { id: "marco-martins", nome: "Marco Nogueira Martins", role: "Docente", iniciais: "NM", lattes: "http://lattes.cnpq.br/" },
            { id: "nathalia-tomazio", nome: "Nathália Beretta Tomazio", role: "Docente", iniciais: "NT", lattes: "http://lattes.cnpq.br/" },
            { id: "nora-maidana", nome: "Nora Lia Maidana", role: "Docente", iniciais: "NM", lattes: "http://lattes.cnpq.br/" },
            { id: "otavio-holanda", nome: "Otavio Bozena Holanda Neto", role: "Docente", iniciais: "OH", lattes: "http://lattes.cnpq.br/" },
            { id: "paula-antunes", nome: "Paula Cristina Guimarães Antunes", role: "Docente", iniciais: "PA", lattes: "http://lattes.cnpq.br/" },
            { id: "paulo-nussenzweig", nome: "Paulo Alberto Nussenzweig", role: "Docente", iniciais: "PN", lattes: "http://lattes.cnpq.br/" },
            { id: "pedro-guillaumon", nome: "Pedro Vinícius Guillaumon", role: "Docente", iniciais: "PG", lattes: "http://lattes.cnpq.br/" },
            { id: "rafael-barros", nome: "Rafael Ferreira Pinto do Rego Barros", role: "Docente", iniciais: "RB", lattes: "http://lattes.cnpq.br/" },
            { id: "ricardo-terini", nome: "Ricardo Andrade Terini", role: "Docente", iniciais: "RT", lattes: "http://lattes.cnpq.br/" },
            { id: "sabrina-carvalho", nome: "Sabrina Gonçalves de Macedo Carvalho", role: "Docente", iniciais: "SC", lattes: "http://lattes.cnpq.br/" },
            { id: "sergio-filho", nome: "Sérgio Martins Filho", role: "Docente", iniciais: "SF", lattes: "http://lattes.cnpq.br/" },
            { id: "valentina-martelli", nome: "Valentina Martelli", role: "Docente", iniciais: "VM", lattes: "http://lattes.cnpq.br/" },
            { id: "vito-vanin", nome: "Vito Roberto Vanin", role: "Docente", iniciais: "VV", lattes: "http://lattes.cnpq.br/" }
        ],
        linhasPesquisa: [
            "Física Nuclear Experimental",
            "Óptica Quântica e Informação Quântica",
            "Astropartículas e Altas Energias",
            "Fluidos Complexos e Matéria Mole",
            "Física com Aceleradores",
            "Ensino de Física e Tecnologias Educacionais"
        ],
        postsGanhadores: [
            { 
                id: "win-fep-1", 
                postId: "post-fep-1", 
                title: "Emaranhamento em Redes de Óptica Quântica", 
                mediaUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800",
                autor: "Paulo Alberto Nussenzweig", 
                categoria: "Excelência em Pesquisa", 
                ano: "2024.2", 
                iniciais: "PN" 
            },
            { 
                id: "win-fep-2", 
                postId: "post-fep-2", 
                title: "Nova Dinâmica em Fluidos Complexos Nanoestruturados", 
                mediaUrl: "https://images.unsplash.com/photo-1614850523296-e8c041de4398?auto=format&fit=crop&q=80&w=800",
                autor: "Antonio Martins Figueiredo Neto", 
                categoria: "Impacto Científico", 
                ano: "2024.1", 
                iniciais: "AF" 
            }
        ]
    },
    "fge": {
        id: "d4000000-0000-0000-0000-000000000000",
        slug: "fge",
        sigla: "FGE",
        nome: "Física Geral",
        descricao: "O Departamento de Física Geral (FGE) é um centro de excelência em pesquisa interdisciplinar, abrangendo desde a biofísica diagnóstica até a cosmologia e gravitação, com forte atuação em física estatística e sistemas complexos.",
        laboratorios: [
            { id: "biof", nome: "Grupo de Biofísica", description: "Estudos de física aplicada a sistemas biológicos e diagnóstico por imagem." },
            { id: "ccgc", nome: "Grupo de Campos, Gravitação e Cosmologia", description: "Pesquisa teórica em relatividade geral, buracos negros e evolução do universo." },
            { id: "fest", nome: "Grupo de Física Estatística", description: "Teoria de transições de fase, fenômenos críticos e sistemas fora do equilíbrio." },
            { id: "fmom", nome: "Grupo de Física Molecular e Modelagem", description: "Cálculos quânticos e modelagem de interações moleculares em fase gasosa e condensada." },
            { id: "pext", nome: "Grupo de Pesquisa em Extensão Universitária", description: "Inovação no ensino de física e comunicação científica com a sociedade." },
            { id: "oasa", nome: "Grupo de Óptica e Sistemas Amorfos", description: "Caracterização de vidros e materiais desordenados utilizando técnicas ópticas." },
            { id: "nean", nome: "Núcleos Exóticos e Astrofísica Nuclear", description: "Estudo de núcleos longe da linha de estabilidade e reações em interiores estelares." }
        ],
        pesquisadores: [
            { id: "adriano-alencar", nome: "Adriano Mesquita Alencar", role: "Docente", iniciais: "AA", lattes: "http://lattes.cnpq.br/" },
            { id: "andre-vieira", nome: "André de Pinho Vieira", role: "Docente", iniciais: "AV", lattes: "http://lattes.cnpq.br/" },
            { id: "carlo-goldoni", nome: "Carlo Goldoni", role: "Docente", iniciais: "CG", lattes: "http://lattes.cnpq.br/" },
            { id: "carlos-fiore", nome: "Carlos Eduardo Fiore dos Santos", role: "Docente", iniciais: "CF", lattes: "http://lattes.cnpq.br/" },
            { id: "domingos-marchetti", nome: "Domingos Humberto Urbano Marchetti", role: "Docente", iniciais: "DM", lattes: "http://lattes.cnpq.br/" },
            { id: "elcio-abdalla", nome: "Elcio Abdalla", role: "Docente", iniciais: "EA", lattes: "http://lattes.cnpq.br/" },
            { id: "eric-garcas", nome: "Eric Alexander Milan Garcas", role: "Docente", iniciais: "EG", lattes: "http://lattes.cnpq.br/" },
            { id: "juliana-raw", nome: "Juliana Raw", role: "Docente", iniciais: "JR", lattes: "http://lattes.cnpq.br/" },
            { id: "kaline-coutinho", nome: "Kaline Rabelo Coutinho", role: "Docente", iniciais: "KC", lattes: "http://lattes.cnpq.br/" },
            { id: "leandro-barbosa", nome: "Leandro R. S. Barbosa", role: "Docente", iniciais: "LB", lattes: "http://lattes.cnpq.br/" },
            { id: "lucas-corneiro", nome: "Lucas Medeiros Corneiro", role: "Docente", iniciais: "LC", lattes: "http://lattes.cnpq.br/" },
            { id: "marcio-varella", nome: "Marcio Teixeira do Nascimento Varella", role: "Docente", iniciais: "MV", lattes: "http://lattes.cnpq.br/" },
            { id: "nestor-alfonso", nome: "Nestor Felipe Caticha Alfonso", role: "Docente", iniciais: "NA", lattes: "http://lattes.cnpq.br/" },
            { id: "sylvio-canuto", nome: "Sylvio Roberto Accioly Canuto", role: "Docente", iniciais: "SC", lattes: "http://lattes.cnpq.br/" },
            { id: "valdir-guimaraes", nome: "Valdir Guimarães", role: "Docente", iniciais: "VG", lattes: "http://lattes.cnpq.br/" }
        ],
        linhasPesquisa: [
            "Biofísica Diagnóstica",
            "Cosmologia e Relatividade Geral",
            "Mecânica Estatística e Redes Cardinais",
            "Física Molecular Teórica",
            "Sistemas Amorfos e Vítreos",
            "Astrofísica Nuclear e Núcleos Exóticos"
        ],
        postsGanhadores: [
            { 
                id: "win-fge-1", 
                postId: "post-fge-1", 
                title: "O Universo Escuro: Buracos Negros e Matéria Escura", 
                mediaUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=800",
                autor: "Elcio Abdalla", 
                categoria: "Divulgação Científica", 
                ano: "2024.2", 
                iniciais: "EA" 
            },
            { 
                id: "win-fge-2", 
                postId: "post-fge-2", 
                title: "Biofísica de Células Cancerígenas", 
                mediaUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800",
                autor: "Adriano Mesquita Alencar", 
                categoria: "Impacto na Saúde", 
                ano: "2024.1", 
                iniciais: "AA" 
            }
        ]
    },
    "fnc": {
        id: "d6000000-0000-0000-0000-000000000000",
        slug: "fnc",
        sigla: "FNC",
        nome: "Física Nuclear",
        descricao: "O Departamento de Física Nuclear (FNC) opera infraestrutura de grande porte, como aceleradores de partículas, para investigar a estrutura do núcleo atômico, reações nucleares e suas aplicações na medicina e no patrimônio cultural.",
        laboratorios: [
            { id: "lafn", nome: "LAFN - Laboratório Aberto de Física Nuclear", description: "Infraestrutura multiusuária para pesquisa em física nuclear básica e aplicada." },
            { id: "dosimetria", nome: "DOSIMETRIA - Laboratório de Dosimetria da Radiação", description: "Desenvolvimento de técnicas para medição de doses de radiação ionizante." },
            { id: "hepic", nome: "HEPIC - High Energy Physics and Instrumentation Center", description: "Pesquisa em física de altas energias e desenvolvimento de instrumentação nuclear." },
            { id: "lacapc", nome: "LACAPC - Lab. de Arqueometria e Ciências Aplicadas ao Patrimônio Cultural", description: "Aplicação de técnicas nucleares para análise e preservação de bens culturais." },
            { id: "lacifid", nome: "LACIFID - Lab. de Cristais Iônicos, Filmes Finos e Datação", description: "Estudos de propriedades ópticas de cristais e datação por termoluminescência." },
            { id: "lamfi", nome: "LAMFI - Lab. de Análises de Materiais por Feixes Iônicos", description: "Polo tecnológico para caracterização de materiais utilizando feixes iônicos acelerados." }
        ],
        pesquisadores: [
            { id: "alberto-soares", nome: "Alberto Luzés Feijó Soares", role: "Docente", iniciais: "AS", lattes: "http://lattes.cnpq.br/" },
            { id: "alberto-torres", nome: "Alberto Martinez Torres", role: "Docente", iniciais: "AT", lattes: "http://lattes.cnpq.br/" },
            { id: "alexandre-suaide", nome: "Alexandre Alarcon do Passo Suaide", role: "Docente", iniciais: "AS", lattes: "http://lattes.cnpq.br/" },
            { id: "ana-mitther", nome: "Ana Julia Silveira Mitther", role: "Docente", iniciais: "AM", lattes: "http://lattes.cnpq.br/" },
            { id: "edilson-silva", nome: "Edilson Honório da Silva", role: "Docente", iniciais: "ES", lattes: "http://lattes.cnpq.br/" },
            { id: "edilson-crema", nome: "Edilson Crema", role: "Docente", iniciais: "EC", lattes: "http://lattes.cnpq.br/" },
            { id: "elisabeth-yoshimura", nome: "Elisabeth Mateus Yoshimura", role: "Docente", iniciais: "EY", lattes: "http://lattes.cnpq.br/" },
            { id: "fabricio-carmo", nome: "Fabricio Marques do Carmo", role: "Docente", iniciais: "FC", lattes: "http://lattes.cnpq.br/" },
            { id: "fernando-navarro", nome: "Fernando Silveira Navarro", role: "Docente", iniciais: "FN", lattes: "http://lattes.cnpq.br/" },
            { id: "iva-gurgel", nome: "Ivã Gurgel", role: "Docente", iniciais: "IG", lattes: "http://lattes.cnpq.br/" },
            { id: "jose-chubaci", nome: "Jose Fernando Diniz Chubaci", role: "Docente", iniciais: "JC", lattes: "http://lattes.cnpq.br/" },
            { id: "jose-duarte", nome: "Jose Luciano Miranda Duarte", role: "Docente", iniciais: "JD", lattes: "http://lattes.cnpq.br/" },
            { id: "jose-oliveira", nome: "Jose Roberto Brandao de Oliveira", role: "Docente", iniciais: "JO", lattes: "http://lattes.cnpq.br/" },
            { id: "kelly-pires", nome: "Kelly Cristina Cezaretto Pires", role: "Docente", iniciais: "KP", lattes: "http://lattes.cnpq.br/" },
            { id: "leandro-casques", nome: "Leandro Romero Casques", role: "Docente", iniciais: "LC", lattes: "http://lattes.cnpq.br/" },
            { id: "marcelo-munhoz", nome: "Marcelo Gameiro Munhoz", role: "Docente", iniciais: "MM", lattes: "http://lattes.cnpq.br/" },
            { id: "marcia-rizzutto", nome: "Marcia de Almeida Rizzutto", role: "Docente", iniciais: "MR", lattes: "http://lattes.cnpq.br/" },
            { id: "marco-bregant", nome: "Marco Bregant", role: "Docente", iniciais: "MB", lattes: "http://lattes.cnpq.br/" },
            { id: "nelio-trindade", nome: "Nelio Marcos Trindade", role: "Docente", iniciais: "NT", lattes: "http://lattes.cnpq.br/" },
            { id: "nelson-carlin", nome: "Nelson Carlin Filho", role: "Docente", iniciais: "NC", lattes: "http://lattes.cnpq.br/" },
            { id: "nemitala-added", nome: "Nemitala Added", role: "Docente", iniciais: "NA", lattes: "http://lattes.cnpq.br/" },
            { id: "nilberto-medina", nome: "Nilberto Heder Medina", role: "Docente", iniciais: "NM", lattes: "http://lattes.cnpq.br/" },
            { id: "osvaldo-santos", nome: "Osvaldo Camargo Botelho dos Santos", role: "Docente", iniciais: "OS", lattes: "http://lattes.cnpq.br/" },
            { id: "paulo-costa", nome: "Paulo Roberto Costa", role: "Docente", iniciais: "PC", lattes: "http://lattes.cnpq.br/" },
            { id: "pedro-almeida", nome: "Pedro Beutênio Mendonça de Almeida", role: "Docente", iniciais: "PA", lattes: "http://lattes.cnpq.br/" },
            { id: "renato-itiga", nome: "Renato Itiga", role: "Docente", iniciais: "RI", lattes: "http://lattes.cnpq.br/" },
            { id: "ricardo-terini", nome: "Ricardo Andrade Terini", role: "Docente", iniciais: "RT", lattes: "http://lattes.cnpq.br/" },
            { id: "rubens-filho", nome: "Rubens Lichtenthäler Filho", role: "Docente", iniciais: "RL", lattes: "http://lattes.cnpq.br/" },
            { id: "saulo-alberton", nome: "Saulo Gabriel Pereira Nascimento Alberton", role: "Docente", iniciais: "SA", lattes: "http://lattes.cnpq.br/" },
            { id: "tiago-silva", nome: "Tiago Fiorini da Silva", role: "Docente", iniciais: "TS", lattes: "http://lattes.cnpq.br/" },
            { id: "valdir-scarduelli", nome: "Valdir Brunetti Scarduelli", role: "Docente", iniciais: "VS", lattes: "http://lattes.cnpq.br/" }
        ],
        linhasPesquisa: [
            "Física Nuclear Experimental",
            "Dosimetria das Radiações e Física Nuclear Aplicada",
            "Física Teórica",
            "Física de Altas Energias",
            "Física Médica",
            "Física Aplicada ao Patrimônio Cultural",
            "Pesquisa em Ensino de Física"
        ],
        postsGanhadores: [
            { 
                id: "win-fnc-1", 
                postId: "post-fnc-1", 
                title: "ALICE: Investigando o Plasma de Quarks e Glúons no CERN", 
                mediaUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
                autor: "Alexandre Alarcon do Passo Suaide", 
                categoria: "Colaboração Internacional", 
                ano: "2024.2", 
                iniciais: "AS" 
            },
            { 
                id: "win-fnc-2", 
                postId: "post-fnc-2", 
                title: "Arqueometria: A Física a Serviço da Arte e História", 
                mediaUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800",
                autor: "Marcia de Almeida Rizzutto", 
                categoria: "Ciência e Cultura", 
                ano: "2024.1", 
                iniciais: "MR" 
            }
        ]
    },
    "dfma": {
        id: "d5000000-0000-0000-0000-000000000000",
        slug: "dfma",
        sigla: "DFMA",
        nome: "Física Matemática",
        descricao: "O Departamento de Física Matemática (DFMA) foca na fundamentação teórica e matemática das leis da física. Suas atividades de pesquisa abrangem áreas na fronteira do conhecimento, como cosmologia teórica e observacional, teoria quântica de campos, física de partículas e astropartículas, além de sistemas de muitos corpos e informação quântica.",
        laboratorios: [],
        pesquisadores: [
            { id: "andre-vieira", nome: "André de Pinho Vieira", role: "Docente", iniciais: "AV", lattes: "http://lattes.cnpq.br/" },
            { id: "barbara-amaral", nome: "Bárbara Lopes Amaral", role: "Docente", iniciais: "BA", lattes: "http://lattes.cnpq.br/" },
            { id: "eduardo-casali", nome: "Eduardo Trevisan Casali", role: "Docente", iniciais: "EC", lattes: "http://lattes.cnpq.br/" },
            { id: "gabriel-marques", nome: "Gabriel Santos Marques", role: "Docente", iniciais: "GM", lattes: "http://lattes.cnpq.br/" },
            { id: "gustavo-burdman", nome: "Gustavo Alberto Burdman", role: "Docente", iniciais: "GB", lattes: "http://lattes.cnpq.br/" },
            { id: "joao-barata", nome: "João Carlos Alves Barata", role: "Docente", iniciais: "JB", lattes: "http://lattes.cnpq.br/" },
            { id: "jorge-lyra", nome: "Jorge Lacerda de Lyra", role: "Docente", iniciais: "JL", lattes: "http://lattes.cnpq.br/" },
            { id: "luis-abramo", nome: "Luís Raul Weber Abramo", role: "Docente", iniciais: "LA", lattes: "http://lattes.cnpq.br/" },
            { id: "marcos-lima", nome: "Marcos Vinícius Borges Teixeira Lima", role: "Docente", iniciais: "ML", lattes: "http://lattes.cnpq.br/" },
            { id: "matthew-luzum", nome: "Matthew William Luzum", role: "Docente", iniciais: "ML", lattes: "http://lattes.cnpq.br/" },
            { id: "oscar-eboli", nome: "Oscar José Pinto Éboli", role: "Docente", iniciais: "OE", lattes: "http://lattes.cnpq.br/" },
            { id: "paulo-sobrinho", nome: "Paulo Teotônio Sobrinho", role: "Docente", iniciais: "PS", lattes: "http://lattes.cnpq.br/" },
            { id: "renata-funchal", nome: "Renata Zukanovich Funchal", role: "Docente", iniciais: "RF", lattes: "http://lattes.cnpq.br/" },
            { id: "ricardo-silva", nome: "Ricardo Correa da Silva", role: "Docente", iniciais: "RS", lattes: "http://lattes.cnpq.br/" }
        ],
        linhasPesquisa: [
            "Cosmologia",
            "Teoria de Campos e Cordas",
            "Física de Partículas",
            "Física-Matemática",
            "Íons Pesados Relativísticos",
            "Informação Quântica"
        ],
        postsGanhadores: []
    }
};
