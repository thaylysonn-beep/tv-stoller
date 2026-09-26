// ============================================================
// PORTAL TV CORPORATIVA
// DATABASE TV
// ============================================================

const DatabaseTV = {

    // ========================================================
    // CONFIGURAÇÕES
    // ========================================================

    arquivo:
        "dados/programacao.json",

    pastaVideos:
        "Videos",

    intervaloVerificacao:
        60000,

    versaoAtual:
        0,

    programacao:
        [],

    dados:
        null,

    // ========================================================
    // CARREGAR BANCO
    // ========================================================

    async carregarProgramacao() {

        try {

            const resposta =
                await fetch(
                    this.adicionarCache(
                        this.arquivo
                    ),
                    {
                        method:
                            "GET",

                        cache:
                            "no-store",

                        credentials:
                            "same-origin",

                        headers: {
                            "Cache-Control":
                                "no-cache",

                            "Pragma":
                                "no-cache"
                        }
                    }
                );

            if (!resposta.ok) {

                throw new Error(
                    "Não foi possível carregar a programação. HTTP " +
                    resposta.status
                );

            }

            const dados =
                await resposta.json();

            if (
                !dados ||
                typeof dados !== "object"
            ) {

                throw new Error(
                    "Banco de programação inválido."
                );

            }

            if (
                !Array.isArray(
                    dados.programacao
                )
            ) {

                dados.programacao = [];

            }

            if (
                !Array.isArray(
                    dados.videos
                )
            ) {

                dados.videos = [];

            }

            if (
                !Array.isArray(
                    dados.comunicados
                )
            ) {

                dados.comunicados = [];

            }

            if (
                !Array.isArray(
                    dados.powerbi
                )
            ) {

                dados.powerbi = [];

            }

            this.dados =
                dados;

            this.programacao =
                this.normalizarProgramacao(
                    dados.programacao
                );

            this.versaoAtual =
                Number(
                    dados.versao
                ) || 0;

            console.log(
                "DatabaseTV carregado:",
                dados
            );

            console.log(
                "Programação:",
                this.programacao
            );

            return dados;

        }
        catch (erro) {

            console.warn(
                "DatabaseTV - erro ao carregar SharePoint:",
                erro
            );

            // ------------------------------------------------
            // FALLBACK LOCAL
            // ------------------------------------------------

            const local =
                this.carregarBancoLocal();

            if (local) {

                console.warn(
                    "DatabaseTV usando banco local de contingência."
                );

                this.dados =
                    local;

                this.programacao =
                    this.normalizarProgramacao(
                        local.programacao
                    );

                this.versaoAtual =
                    Number(
                        local.versao
                    ) || 0;

                return local;

            }

            this.dados = {
                sistema:
                    "Portal TV Corporativa",

                versao:
                    0,

                publicado:
                    false,

                ultimaPublicacao:
                    null,

                programacao:
                    [],

                videos:
                    [],

                comunicados:
                    [],

                powerbi:
                    []
            };

            this.programacao = [];

            return this.dados;

        }

    },

    // ========================================================
    // BANCO LOCAL
    // ========================================================

    carregarBancoLocal() {

        try {

            const salvo =
                localStorage.getItem(
                    "portal_tv_corporativa"
                );

            if (!salvo) {
                return null;
            }

            const dados =
                JSON.parse(
                    salvo
                );

            if (
                !dados ||
                typeof dados !== "object"
            ) {

                return null;

            }

            if (
                !Array.isArray(
                    dados.programacao
                )
            ) {

                dados.programacao = [];

            }

            if (
                !Array.isArray(
                    dados.videos
                )
            ) {

                dados.videos = [];

            }

            if (
                !Array.isArray(
                    dados.comunicados
                )
            ) {

                dados.comunicados = [];

            }

            if (
                !Array.isArray(
                    dados.powerbi
                )
            ) {

                dados.powerbi = [];

            }

            return dados;

        }
        catch (erro) {

            console.error(
                "Erro no banco local:",
                erro
            );

            return null;

        }

    },

    // ========================================================
    // BANCO COMPLETO
    // ========================================================

    async carregarBancoCompleto() {

        const dados =
            await this.carregarProgramacao();

        dados.videos =
            Array.isArray(
                dados.videos
            )
                ? dados.videos
                : [];

        dados.comunicados =
            Array.isArray(
                dados.comunicados
            )
                ? dados.comunicados
                : [];

        dados.powerbi =
            Array.isArray(
                dados.powerbi
            )
                ? dados.powerbi
                : [];

        dados.programacao =
            Array.isArray(
                dados.programacao
            )
                ? dados.programacao
                : [];

        return dados;

    },

    // ========================================================
    // VERIFICAR ATUALIZAÇÃO
    // ========================================================

    async verificarAtualizacao() {

        try {

            const anterior =
                this.versaoAtual;

            await this.carregarProgramacao();

            return (
                this.versaoAtual >
                anterior
            );

        }
        catch {

            return false;

        }

    },

    // ========================================================
    // OBTENÇÕES
    // ========================================================

    obterProgramacao() {

        return Array.isArray(
            this.programacao
        )
            ? [
                ...this.programacao
            ]
            : [];

    },

    obterItem(id) {

        if (!id) {
            return null;
        }

        return (
            this.programacao.find(
                item =>
                    item &&
                    item.id === id
            ) || null
        );

    },

    obterItensPublicados() {

        return this.programacao.filter(
            item =>
                item &&
                item.publicado !== false &&
                item.ativo !== false
        );

    },

    possuiProgramacao() {

        return (
            this.obterItensPublicados()
                .length > 0
        );

    },

    obterVersao() {

        return Number(
            this.versaoAtual
        ) || 0;

    },

    obterDataPublicacao() {

        return this.dados
            ? (
                this.dados.ultimaPublicacao ||
                this.dados.ultimaAtualizacao ||
                null
            )
            : null;

    },

    estaPublicado() {

        return this.dados
            ? this.dados.publicado === true
            : false;

    },

    // ========================================================
    // URL DOS VÍDEOS
    // ========================================================

    montarUrlVideo(
        arquivo
    ) {

        if (!arquivo) {
            return "";
        }

        const valor =
            String(
                arquivo
            ).trim();

        // URL absoluta
        if (
            /^https?:\/\//i.test(
                valor
            )
        ) {

            return valor;

        }

        const origem =
            window.location.origin;

        // ----------------------------------------------------
        // SERVER RELATIVE
        // ----------------------------------------------------

        if (
            valor.startsWith("/")
        ) {

            return (
                origem +
                valor
            );

        }

        // ----------------------------------------------------
        // URL RELATIVA DO SISTEMA
        // ----------------------------------------------------

        if (
            valor.startsWith("./") ||
            valor.startsWith("../")
        ) {

            return new URL(
                valor,
                window.location.href
            ).href;

        }

        // ----------------------------------------------------
        // ARQUIVO DENTRO DA PASTA VIDEOS
        // ----------------------------------------------------

        const caminhoBase =
            "/sites/OperationalPeopleDevelopment/" +
            "Shared Documents/General/" +
            "Operational People Development/" +
            "09. Comunicação Interna/" +
            "8. TV/" +
            this.pastaVideos +
            "/";

        const nomeSeguro =
            valor
                .split("/")
                .map(
                    parte => {

                        try {

                            return encodeURIComponent(
                                decodeURIComponent(
                                    parte
                                )
                            );

                        }
                        catch {

                            return encodeURIComponent(
                                parte
                            );

                        }

                    }
                )
                .join("/");

        return (
            origem +
            caminhoBase +
            nomeSeguro
        );

    },

    // ========================================================
    // NORMALIZAR URL
    // ========================================================

    normalizarUrlVideo(
        item
    ) {

        if (!item) {
            return "";
        }

        const possibilidades = [
            item.url,
            item.arquivoUrl,
            item.fileUrl,
            item.videoUrl,
            item.arquivo
        ];

        for (
            const valor of possibilidades
        ) {

            if (!valor) {
                continue;
            }

            const texto =
                String(
                    valor
                ).trim();

            if (
                /^https?:\/\//i.test(
                    texto
                )
            ) {

                return texto;

            }

            if (
                texto.startsWith("/")
            ) {

                return (
                    window.location.origin +
                    texto
                );

            }

        }

        if (
            item.arquivo
        ) {

            return this.montarUrlVideo(
                item.arquivo
            );

        }

        return "";

    },

    // ========================================================
    // FILTRO TV
    // ========================================================

    itemPertenceATV(
        item
    ) {

        if (!item) {
            return false;
        }

        if (
            !item.tvId &&
            !item.tvIds &&
            !item.grupo &&
            !item.grupos
        ) {

            return true;

        }

        const configuracao =
            this.dados?.configuracao ||
            {};

        const tvId =
            configuracao.tvId ||
            null;

        const grupo =
            configuracao.grupo ||
            "GERAL";

        if (
            item.tvId
        ) {

            return (
                item.tvId === tvId
            );

        }

        if (
            Array.isArray(
                item.tvIds
            )
        ) {

            return item.tvIds.includes(
                tvId
            );

        }

        if (
            item.grupo
        ) {

            return (
                item.grupo === grupo
            );

        }

        if (
            Array.isArray(
                item.grupos
            )
        ) {

            return item.grupos.includes(
                grupo
            );

        }

        return true;

    },

    // ========================================================
    // PROGRAMAÇÃO DA TV
    // ========================================================

    obterProgramacaoDaTV() {

        return this.programacao.filter(
            item => {

                if (!item) {
                    return false;
                }

                if (
                    item.publicado === false
                ) {

                    return false;

                }

                if (
                    item.ativo === false
                ) {

                    return false;

                }

                return this.itemPertenceATV(
                    item
                );

            }
        );

    },

    // ========================================================
    // ORDENAÇÃO
    // ========================================================

    ordenarProgramacao(
        lista
    ) {

        if (
            !Array.isArray(lista)
        ) {

            return [];

        }

        return [
            ...lista
        ].sort(
            (a,b) =>
                (
                    Number(
                        a.ordem
                    ) || 0
                ) -
                (
                    Number(
                        b.ordem
                    ) || 0
                )
        );

    },

    obterProgramacaoOrdenada() {

        return this.ordenarProgramacao(
            this.obterProgramacaoDaTV()
        );

    },

    // ========================================================
    // NORMALIZAÇÃO
    // ========================================================

    normalizarItem(
        item
    ) {

        if (
            !item ||
            typeof item !== "object"
        ) {

            return null;

        }

        const normalizado = {

            id:
                item.id ||
                "",

            conteudoId:
                item.conteudoId ||
                item.id ||
                "",

            tipo:
                String(
                    item.tipo ||
                    ""
                ).toLowerCase(),

            nome:
                item.nome ||
                item.titulo ||
                "Sem nome",

            titulo:
                item.titulo ||
                item.nome ||
                "",

            url:
                item.url ||
                "",

            arquivo:
                item.arquivo ||
                "",

            arquivoUrl:
                item.arquivoUrl ||
                "",

            fileUrl:
                item.fileUrl ||
                "",

            imagem:
                item.imagem ||
                "",

            mensagem:
                item.mensagem ||
                "",

            duracao:
                Number(
                    item.duracao
                ) || 10,

            ordem:
                Number(
                    item.ordem
                ) || 0,

            ativo:
                item.ativo !== false,

            publicado:
                item.publicado !== false,

            dataInicio:
                item.dataInicio ||
                "",

            dataFim:
                item.dataFim ||
                "",

            horaInicio:
                item.horaInicio ||
                "",

            horaFim:
                item.horaFim ||
                "",

            tvId:
                item.tvId ||
                null,

            grupo:
                item.grupo ||
                null

        };

        if (
            normalizado.tipo === "video"
        ) {

            normalizado.url =
                this.normalizarUrlVideo(
                    normalizado
                );

        }

        return normalizado;

    },

    normalizarProgramacao(
        lista
    ) {

        if (
            !Array.isArray(lista)
        ) {

            return [];

        }

        return lista
            .map(
                item =>
                    this.normalizarItem(
                        item
                    )
            )
            .filter(
                item =>
                    item !== null
            );

    },

    // ========================================================
    // INFORMAÇÕES
    // ========================================================

    obterInformacoes() {

        return {

            versao:
                this.obterVersao(),

            publicado:
                this.estaPublicado(),

            ultimaPublicacao:
                this.obterDataPublicacao(),

            totalItens:
                this.programacao.length,

            itensDisponiveis:
                this.obterItensPublicados()
                    .length

        };

    },

    // ========================================================
    // CACHE
    // ========================================================

    adicionarCache(
        url
    ) {

        if (!url) {
            return "";
        }

        const separador =
            url.includes("?")
                ? "&"
                : "?";

        return (
            url +
            separador +
            "v=" +
            Date.now()
        );

    }

};


// ============================================================
// GLOBAL
// ============================================================

window.DatabaseTV =
    DatabaseTV;