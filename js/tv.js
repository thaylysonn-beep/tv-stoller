// ============================================================
// TV CORPORATIVA
// MODO TV / PLAYER
// ============================================================

const TVCorporativa = {

    // ========================================================
    // CONFIGURAÇÕES
    // ========================================================

    intervaloAtualizacao: 60000,

    programacao: [],

    indiceAtual: 0,

    player: null,

    timer: null,

    intervaloTimer: null,

    carregando: false,

    inicializado: false,

    const TVCorporativa = {

    // ========================================================
    // CONFIGURAÇÕES
    // ========================================================

    intervaloAtualizacao: 60000,

    programacao: [],

    indiceAtual: 0,

    player: null,

    timer: null,

    intervaloTimer: null,

    carregando: false,

    inicializado: false,

    // ========================================================
    // VÍDEOS LOCAIS
    // ========================================================

    pastaVideos: "videos/",
    // ========================================================
    // INICIAR TV
    // ========================================================

    async iniciar() {

        if (this.inicializado) {
            return;
        }

        this.inicializado = true;

        console.log(
            "TV Corporativa iniciando..."
        );

        this.player =
            document.getElementById(
                "player"
            );

        if (!this.player) {

            console.error(
                "Elemento #player não encontrado."
            );

            return;
        }

        this.configurarPlayer();

        await this.carregarProgramacao();

        this.iniciarAtualizacaoAutomatica();

        this.reproduzirAtual();
    },

    // ========================================================
    // CARREGAR PROGRAMAÇÃO
    // ========================================================

    async carregarProgramacao() {

        if (this.carregando) {
            return;
        }

        this.carregando = true;

        try {

            console.log(
                "Carregando programação da TV..."
            );

            let dados = null;

            // ------------------------------------------------
            // PRIMEIRA TENTATIVA
            // ------------------------------------------------

            if (
                window.DatabaseTV &&
                typeof DatabaseTV.carregarProgramacao ===
                    "function"
            ) {

                try {

                    dados =
                        await DatabaseTV.carregarProgramacao();

                    console.log(
                        "Retorno de carregarProgramacao:",
                        dados
                    );

                }
                catch (erro) {

                    console.warn(
                        "DatabaseTV.carregarProgramacao falhou:",
                        erro
                    );
                }
            }

            // ------------------------------------------------
            // SEGUNDA TENTATIVA
            // ------------------------------------------------

            if (
                !this.temProgramacaoValida(dados) &&
                window.DatabaseTV &&
                typeof DatabaseTV.carregarBancoCompleto ===
                    "function"
            ) {

                try {

                    console.log(
                        "Tentando carregar banco completo..."
                    );

                    dados =
                        await DatabaseTV.carregarBancoCompleto();

                    console.log(
                        "Retorno de carregarBancoCompleto:",
                        dados
                    );

                }
                catch (erro) {

                    console.warn(
                        "DatabaseTV.carregarBancoCompleto falhou:",
                        erro
                    );
                }
            }

            // ------------------------------------------------
            // EXTRAIR PROGRAMAÇÃO
            // ------------------------------------------------

            const lista =
                this.extrairProgramacao(
                    dados
                );

            if (!lista.length) {

                console.warn(
                    "Nenhuma programação encontrada."
                );

                this.programacao = [];

                this.mostrarTelaSemProgramacao(
                    "Nenhum conteúdo publicado na programação."
                );

                return;
            }

            // ------------------------------------------------
            // NORMALIZAR
            // ------------------------------------------------

            this.programacao =
                lista
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

            console.log(
                "Programação normalizada:",
                this.programacao
            );

        }
        catch (erro) {

            console.error(
                "Erro ao carregar programação:",
                erro
            );

            this.programacao = [];

            this.mostrarTelaErro(
                "Não foi possível carregar a programação da TV.",
                erro
            );

        }
        finally {

            this.carregando = false;

        }
    },

    // ========================================================
    // VERIFICAR PROGRAMAÇÃO
    // ========================================================

    temProgramacaoValida(dados) {

        if (!dados) {
            return false;
        }

        if (Array.isArray(dados)) {
            return dados.length > 0;
        }

        if (
            Array.isArray(
                dados.programacao
            )
        ) {

            return dados.programacao.length > 0;
        }

        if (
            dados.dados &&
            Array.isArray(
                dados.dados.programacao
            )
        ) {

            return dados.dados.programacao.length > 0;
        }

        if (
            dados.banco &&
            Array.isArray(
                dados.banco.programacao
            )
        ) {

            return dados.banco.programacao.length > 0;
        }

        return false;
    },

    // ========================================================
    // EXTRAIR PROGRAMAÇÃO
    // ========================================================

    extrairProgramacao(dados) {

        if (!dados) {
            return [];
        }

        // -----------------------------------------------
        // ARRAY DIRETO
        // -----------------------------------------------

        if (Array.isArray(dados)) {
            return dados;
        }

        // -----------------------------------------------
        // { programacao: [] }
        // -----------------------------------------------

        if (
            Array.isArray(
                dados.programacao
            )
        ) {

            return dados.programacao;
        }

        // -----------------------------------------------
        // { dados: { programacao: [] } }
        // -----------------------------------------------

        if (
            dados.dados &&
            Array.isArray(
                dados.dados.programacao
            )
        ) {

            return dados.dados.programacao;
        }

        // -----------------------------------------------
        // { banco: { programacao: [] } }
        // -----------------------------------------------

        if (
            dados.banco &&
            Array.isArray(
                dados.banco.programacao
            )
        ) {

            return dados.banco.programacao;
        }

        // -----------------------------------------------
        // { data: { programacao: [] } }
        // -----------------------------------------------

        if (
            dados.data &&
            Array.isArray(
                dados.data.programacao
            )
        ) {

            return dados.data.programacao;
        }

        return [];
    },

    // ========================================================
    // NORMALIZAR ITEM
    // ========================================================

    normalizarItem(item) {

        if (!item) {
            return null;
        }

        const resultado = {
            ...item
        };

        // ------------------------------------------------
        // TIPO
        // ------------------------------------------------

        resultado.tipo =
            String(
                resultado.tipo ||
                resultado.contentType ||
                resultado.tipoConteudo ||
                ""
            )
            .toLowerCase()
            .trim();

        // ------------------------------------------------
        // ID
        // ------------------------------------------------

        resultado.id =
            resultado.id ||
            resultado.conteudoId ||
            "";

        // ------------------------------------------------
        // NOME
        // ------------------------------------------------

        resultado.nome =
            resultado.nome ||
            resultado.titulo ||
            resultado.name ||
            "Conteúdo sem nome";

        resultado.titulo =
            resultado.titulo ||
            resultado.nome ||
            "";

        // ------------------------------------------------
        // URL / CAMINHO
        // ------------------------------------------------

        resultado.url =
            this.obterURLConteudo(
                resultado
            );

        // ------------------------------------------------
        // DURAÇÃO
        // ------------------------------------------------

        resultado.duracao =
            Number(
                resultado.duracao
            ) ||
            this.obterDuracaoPadrao(
                resultado.tipo
            );

        // ------------------------------------------------
        // ATIVO
        // ------------------------------------------------

        resultado.ativo =
            resultado.ativo !== false;

        // ------------------------------------------------
        // PUBLICADO
        // ------------------------------------------------

        resultado.publicado =
            resultado.publicado !== false;

        return resultado;
    },

    // ========================================================
    // OBTER URL / CAMINHO DO CONTEÚDO
    // ========================================================

    obterURLConteudo(item) {

        if (!item) {
            return "";
        }

        // ------------------------------------------------
        // VÍDEO LOCAL
        // ------------------------------------------------

        if (
            String(item.tipo || "")
                .toLowerCase()
                .trim() === "video"
        ) {

            const nomeVideo =
                item.arquivoLocal ||
                item.nomeArquivo ||
                item.fileName ||
                item.filename ||
                item.video ||
                item.arquivo ||
                item.url ||
                item.src ||
                "";

            if (
                typeof nomeVideo === "string" &&
                nomeVideo.trim()
            ) {

                return this.obterCaminhoVideoLocal(
                    nomeVideo.trim()
                );
            }
        }

        // ------------------------------------------------
        // URL NORMAL
        // ------------------------------------------------

        const candidatos = [

            item.url,

            item.URL,

            item.src,

            item.videoUrl,

            item.videoURL,

            item.imagem,

            item.arquivoUrl,

            item.fileUrl,

            item.serverRelativeUrl,

            item.ServerRelativeUrl,

            item.imagemServerRelativeUrl,

            item.urlSharePoint

        ];

        for (
            const candidato of candidatos
        ) {

            if (
                candidato &&
                typeof candidato ===
                    "string"
            ) {

                const url =
                    candidato.trim();

                if (url) {

                    return this.converterURLSharePoint(
                        url
                    );
                }
            }
        }

        // ------------------------------------------------
        // ARQUIVO DENTRO DO OBJETO
        // ------------------------------------------------

        if (
            item.arquivo &&
            typeof item.arquivo ===
                "object"
        ) {

            const urlArquivo =
                item.arquivo.ServerRelativeUrl ||
                item.arquivo.serverRelativeUrl ||
                item.arquivo.Url ||
                item.arquivo.url;

            if (urlArquivo) {

                return this.converterURLSharePoint(
                    urlArquivo
                );
            }
        }

        return "";
    },

    // ========================================================
    // OBTER CAMINHO DO VÍDEO LOCAL
    // ========================================================

    obterCaminhoVideoLocal(nomeArquivo) {

        if (!nomeArquivo) {
            return "";
        }

        let caminho =
            String(nomeArquivo).trim();

        // ------------------------------------------------
        // SE JÁ FOR UMA URL COMPLETA
        // ------------------------------------------------

        if (
            /^https?:\/\//i.test(
                caminho
            )
        ) {

            return caminho;
        }

        // ------------------------------------------------
        // SE FOR CAMINHO ABSOLUTO
        // NÃO ALTERAR
        // ------------------------------------------------

        if (
            caminho.startsWith("/")
        ) {

            return caminho;
        }

        // ------------------------------------------------
        // REMOVER ./ INICIAL
        // ------------------------------------------------

        caminho =
            caminho.replace(
                /^\.\/+/,
                ""
            );

        // ------------------------------------------------
        // SE JÁ ESTIVER NA PASTA VIDEOS
        // ------------------------------------------------

        if (
            /^videos[\/\\]/i.test(
                caminho
            )
        ) {

            return caminho.replace(
                /\\/g,
                "/"
            );
        }

        // ------------------------------------------------
        // PEGAR SOMENTE O NOME DO ARQUIVO
        // ------------------------------------------------

        caminho =
            caminho
                .split("/")
                .pop();

        // ------------------------------------------------
        // MONTAR CAMINHO
        // ------------------------------------------------

        return (
            this.pastaVideos +
            encodeURIComponent(
                caminho
            )
        );
    },

    // ========================================================
    // CONVERTER URL SHAREPOINT
    // ========================================================

    converterURLSharePoint(url) {

        if (!url) {
            return "";
        }

        url =
            String(url).trim();

        // ------------------------------------------------
        // URL ABSOLUTA
        // ------------------------------------------------

        if (
            /^https?:\/\//i.test(
                url
            )
        ) {

            return url;
        }

        // ------------------------------------------------
        // SERVER RELATIVE
        // ------------------------------------------------

        if (
            url.startsWith("/")
        ) {

            return (
                this.dominioSharePoint +
                this.codificarCaminhoSharePoint(
                    url
                )
            );
        }

        // ------------------------------------------------
        // URL SEM PROTOCOLO
        // ------------------------------------------------

        if (
            url.startsWith(
                "sites/"
            )
        ) {

            return (
                this.dominioSharePoint +
                "/" +
                this.codificarCaminhoSharePoint(
                    "/" + url
                )
            );
        }

        return url;
    },

    // ========================================================
    // CODIFICAR CAMINHO SHAREPOINT
    // ========================================================

    codificarCaminhoSharePoint(
        caminho
    ) {

        if (!caminho) {
            return "";
        }

        try {

            return String(
                caminho
            )
            .split("/")
            .map(
                parte => {

                    if (!parte) {
                        return "";
                    }

                    try {

                        return encodeURIComponent(
                            decodeURIComponent(
                                parte
                            )
                        );

                    }
                    catch (erro) {

                        return encodeURIComponent(
                            parte
                        );
                    }
                }
            )
            .join("/");

        }
        catch (erro) {

            return caminho;
        }
    },

    // ========================================================
    // DURAÇÃO PADRÃO
    // ========================================================

    obterDuracaoPadrao(tipo) {

        if (
            tipo === "video"
        ) {

            return 0;
        }

        if (
            tipo === "powerbi"
        ) {

            return 60000;
        }

        return 10000;
    },
    // ========================================================
// DURAÇÃO PADRÃO
// ========================================================

obterDuracaoPadrao(tipo) {

    if (
        tipo === "video"
    ) {

        return 0;
    }

    if (
        tipo === "powerbi"
    ) {

        return 60000;
    }

    return 10000;
},
// ========================================================
// CONFIGURAR PLAYER
// ========================================================

configurarPlayer() {

    const player =
        this.player;

    if (!player) {
        return;
    }

    player.controls = false;

    player.removeAttribute(
        "controls"
    );

    player.autoplay = true;

    player.muted = true;

    player.playsInline = true;

    player.setAttribute(
        "playsinline",
        ""
    );

    player.setAttribute(
        "webkit-playsinline",
        ""
    );

    // ----------------------------------------------------
    // VÍDEO FINALIZADO
    // ----------------------------------------------------

    player.addEventListener(
        "ended",
        () => {

            console.log(
                "Vídeo finalizado."
            );

            this.proximo();

        }
    );

    // ----------------------------------------------------
    // ERRO NO VÍDEO
    // ----------------------------------------------------

    player.addEventListener(
        "error",
        () => {

            console.error(
                "Erro ao reproduzir vídeo:",
                player.error
            );

            this.proximoComAtraso(
                1500
            );

        }
    );

},

// ========================================================
// REPRODUZIR ITEM ATUAL
// ========================================================

reproduzirAtual() {

    if (
        !this.programacao ||
        !this.programacao.length
    ) {

        this.mostrarTelaSemProgramacao();

        return;
    }

    let tentativas = 0;

    while (
        tentativas <
        this.programacao.length
    ) {

        if (
            this.indiceAtual >=
            this.programacao.length
        ) {

            this.indiceAtual = 0;

        }

        const item =
            this.programacao[
                this.indiceAtual
            ];

        if (
            this.itemPodeSerExibido(
                item
            )
        ) {

            console.log(
                "Exibindo conteúdo:",
                item
            );

            // --------------------------------------------
            // VÍDEO
            // --------------------------------------------

            if (
                item.tipo ===
                "video"
            ) {

                this.reproduzirVideo(
                    item
                );

                return;
            }

            // --------------------------------------------
            // COMUNICADO
            // --------------------------------------------

            if (
                item.tipo ===
                "comunicado"
            ) {

                this.reproduzirComunicado(
                    item
                );

                return;
            }

            // --------------------------------------------
            // POWER BI
            // --------------------------------------------

            if (
                item.tipo ===
                "powerbi"
            ) {

                this.reproduzirPowerBI(
                    item
                );

                return;
            }

        }

        this.indiceAtual++;

        tentativas++;

    }

    this.mostrarTelaSemProgramacao(
        "Nenhum conteúdo está disponível para o horário atual."
    );

},

// ========================================================
// REPRODUZIR VÍDEO
// ========================================================

reproduzirVideo(item) {

    const player =
        this.player;

    if (!player) {
        return;
    }

    // ----------------------------------------------------
    // OBTER CAMINHO DO VÍDEO
    // ----------------------------------------------------

    const url =
        this.obterURLConteudo(
            item
        );

    console.log(
        "Caminho do vídeo:",
        url
    );

    // ----------------------------------------------------
    // VALIDAR CAMINHO
    // ----------------------------------------------------

    if (!url) {

        console.error(
            "Vídeo sem caminho:",
            item
        );

        this.proximoComAtraso(
            1000
        );

        return;
    }

    // ----------------------------------------------------
    // LIMPAR TELA
    // ----------------------------------------------------

    this.limparTela();

    player.style.display =
        "block";

    // ----------------------------------------------------
    // PARAR VÍDEO ANTERIOR
    // ----------------------------------------------------

    try {

        player.pause();

    }
    catch (erro) {

        console.warn(
            "Não foi possível pausar vídeo anterior.",
            erro
        );

    }

    player.removeAttribute(
        "src"
    );

    player.load();

    // ----------------------------------------------------
    // ADICIONAR CACHE
    // ----------------------------------------------------

    const urlComCache =
        this.adicionarCache(
            url
        );

    console.log(
        "Reproduzindo vídeo:",
        urlComCache
    );

    // ----------------------------------------------------
    // DEFINIR NOVO VÍDEO
    // ----------------------------------------------------

    player.src =
        urlComCache;

    player.load();

    // ----------------------------------------------------
    // INICIAR REPRODUÇÃO
    // ----------------------------------------------------

    const promessa =
        player.play();

    if (
        promessa &&
        typeof promessa.catch ===
            "function"
    ) {

        promessa.catch(
            erro => {

                console.error(
                    "Erro ao iniciar vídeo:",
                    erro
                );

                // ----------------------------------------
                // SEGUNDA TENTATIVA
                // SEM CACHE
                // ----------------------------------------

                setTimeout(
                    () => {

                        try {

                            player.src =
                                url;

                            player.load();

                            const segundaTentativa =
                                player.play();

                            if (
                                segundaTentativa &&
                                segundaTentativa.catch
                            ) {

                                segundaTentativa.catch(
                                    erro2 => {

                                        console.error(
                                            "Segunda tentativa falhou:",
                                            erro2
                                        );

                                        this.proximoComAtraso(
                                            1500
                                        );

                                    }
                                );

                            }

                        }
                        catch (
                            erro3
                        ) {

                            console.error(
                                "Erro na segunda tentativa:",
                                erro3
                            );

                            this.proximoComAtraso(
                                1500
                            );

                        }

                    },
                    1000
                );

            }
        );

    }

},
// ========================================================
// COMUNICADO
// ========================================================

reproduzirComunicado(item) {

    const player =
        this.player;

    if (player) {

        player.pause();

        player.removeAttribute(
            "src"
        );

        player.load();

        player.style.display =
            "none";

    }

    const tela =
        document.getElementById(
            "tvConteudo"
        );

    if (!tela) {

        console.error(
            "tvConteudo não encontrado."
        );

        return;
    }

    tela.style.display =
        "flex";

    const titulo =
        item.titulo ||
        item.nome ||
        "";

    const mensagem =
        item.mensagem ||
        "";

    const imagem =
        item.imagem ||
        "";

    tela.innerHTML = `
        <div
            class="tv-comunicado"
            style="
                width:100%;
                height:100%;
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                text-align:center;
            "
        >

            ${
                titulo
                    ? `
                        <h1>
                            ${this.escapeHTML(
                                titulo
                            )}
                        </h1>
                    `
                    : ""
            }

            ${
                mensagem
                    ? `
                        <p>
                            ${this.escapeHTML(
                                mensagem
                            )}
                        </p>
                    `
                    : ""
            }

            ${
                imagem
                    ? `
                        <img
                            src="${this.escapeAttribute(
                                this.adicionarCache(
                                    this.converterURLSharePoint(
                                        imagem
                                    )
                                )
                            )}"
                            class="tv-imagem"
                        >
                    `
                    : ""
            }

        </div>
    `;

    const duracao =
        Number(
            item.duracao
        ) || 10000;

    clearTimeout(
        this.timer
    );

    this.timer =
        setTimeout(
            () => {

                this.proximo();

            },
            duracao
        );

},

// ========================================================
// POWER BI
// ========================================================

reproduzirPowerBI(item) {

    const player =
        this.player;

    if (player) {

        player.pause();

        player.removeAttribute(
            "src"
        );

        player.load();

        player.style.display =
            "none";

    }

    const tela =
        document.getElementById(
            "tvConteudo"
        );

    if (!tela) {

        console.error(
            "tvConteudo não encontrado."
        );

        return;
    }

    tela.style.display =
        "block";

    tela.innerHTML = `
        <iframe
            src="${this.escapeAttribute(
                item.url || ""
            )}"
            class="tv-powerbi"
            frameborder="0"
            allowfullscreen="true"
            style="
                width:100%;
                height:100%;
                border:0;
            "
        ></iframe>
    `;

    const duracao =
        Number(
            item.duracao
        ) || 60000;

    clearTimeout(
        this.timer
    );

    this.timer =
        setTimeout(
            () => {

                this.proximo();

            },
            duracao
        );

},

// ========================================================
// PRÓXIMO CONTEÚDO
// ========================================================

proximo() {

    clearTimeout(
        this.timer
    );

    if (
        !this.programacao.length
    ) {

        this.mostrarTelaSemProgramacao();

        return;
    }

    this.indiceAtual++;

    if (
        this.indiceAtual >=
        this.programacao.length
    ) {

        this.indiceAtual = 0;

    }

    this.reproduzirAtual();

},

// ========================================================
// PRÓXIMO COM ATRASO
// ========================================================

proximoComAtraso(
    atraso = 1500
) {

    clearTimeout(
        this.timer
    );

    this.timer =
        setTimeout(
            () => {

                this.proximo();

            },
            atraso
        );

},

// ========================================================
// VERIFICAR SE ITEM PODE SER EXIBIDO
// ========================================================

itemPodeSerExibido(item) {

    if (!item) {
        return false;
    }

    // ----------------------------------------------------
    // ATIVO
    // ----------------------------------------------------

    if (
        item.ativo === false
    ) {

        return false;

    }

    // ----------------------------------------------------
    // PUBLICADO
    // ----------------------------------------------------

    if (
        item.publicado === false
    ) {

        return false;

    }

    const agora =
        new Date();

    // ----------------------------------------------------
    // DATA INICIAL
    // ----------------------------------------------------

    if (
        item.dataInicio
    ) {

        const inicio =
            this.converterData(
                item.dataInicio
            );

        if (
            inicio &&
            agora < inicio
        ) {

            return false;

        }

    }

    // ----------------------------------------------------
    // DATA FINAL
    // ----------------------------------------------------

    if (
        item.dataFim
    ) {

        const fim =
            this.converterDataFinal(
                item.dataFim
            );

        if (
            fim &&
            agora > fim
        ) {

            return false;

        }

    }

    // ----------------------------------------------------
    // HORÁRIO INICIAL
    // ----------------------------------------------------

    if (
        item.horaInicio
    ) {

        const atual =
            agora.getHours() * 60 +
            agora.getMinutes();

        const partes =
            String(
                item.horaInicio
            ).split(":");

        const inicio =
            Number(
                partes[0]
            ) * 60 +
            Number(
                partes[1]
            );

        if (
            atual < inicio
        ) {

            return false;

        }

    }

    // ----------------------------------------------------
    // HORÁRIO FINAL
    // ----------------------------------------------------

    if (
        item.horaFim
    ) {

        const atual =
            agora.getHours() * 60 +
            agora.getMinutes();

        const partes =
            String(
                item.horaFim
            ).split(":");

        const fim =
            Number(
                partes[0]
            ) * 60 +
            Number(
                partes[1]
            );

        if (
            atual > fim
        ) {

            return false;

        }

    }

    return true;

},

// ========================================================
// CONVERTER DATA
// ========================================================

converterData(valor) {

    if (!valor) {
        return null;
    }

    const data =
        new Date(
            valor
        );

    if (
        Number.isNaN(
            data.getTime()
        )
    ) {

        return null;

    }

    return data;

},

// ========================================================
// CONVERTER DATA FINAL
// ========================================================

converterDataFinal(valor) {

    if (!valor) {
        return null;
    }

    // ----------------------------------------------------
    // DATA NO FORMATO YYYY-MM-DD
    // ----------------------------------------------------

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            String(valor)
        )
    ) {

        const partes =
            String(
                valor
            ).split("-");

        return new Date(
            Number(partes[0]),
            Number(partes[1]) - 1,
            Number(partes[2]),
            23,
            59,
            59
        );

    }

    return this.converterData(
        valor
    );

},
// ========================================================
// ATUALIZAÇÃO AUTOMÁTICA
// ========================================================

iniciarAtualizacaoAutomatica() {

    if (
        this.intervaloTimer
    ) {

        clearInterval(
            this.intervaloTimer
        );

    }

    this.intervaloTimer =
        setInterval(
            async () => {

                console.log(
                    "Atualizando programação..."
                );

                const indiceAntes =
                    this.indiceAtual;

                await this.carregarProgramacao();

                if (
                    !this.programacao.length
                ) {

                    this.mostrarTelaSemProgramacao();

                    return;

                }

                if (
                    indiceAntes >=
                    this.programacao.length
                ) {

                    this.indiceAtual = 0;

                    this.reproduzirAtual();

                }

            },
            this.intervaloAtualizacao
        );

},

// ========================================================
// TELA SEM PROGRAMAÇÃO
// ========================================================

mostrarTelaSemProgramacao(
    mensagem
) {

    if (this.player) {

        this.player.pause();

        this.player.removeAttribute(
            "src"
        );

        this.player.load();

        this.player.style.display =
            "none";

    }

    const tela =
        document.getElementById(
            "tvConteudo"
        );

    if (!tela) {
        return;
    }

    tela.style.display =
        "flex";

    tela.innerHTML = `
        <div
            style="
                width:100%;
                height:100%;
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                text-align:center;
                color:white;
                font-family:Arial,sans-serif;
                box-sizing:border-box;
                padding:40px;
            "
        >

            <h1>
                TV Corporativa
            </h1>

            <p>
                ${
                    this.escapeHTML(
                        mensagem ||
                        "Nenhum conteúdo programado."
                    )
                }
            </p>

        </div>
    `;

},

// ========================================================
// TELA DE ERRO
// ========================================================

mostrarTelaErro(
    mensagem,
    erro
) {

    if (this.player) {

        this.player.pause();

        this.player.removeAttribute(
            "src"
        );

        this.player.load();

        this.player.style.display =
            "none";

    }

    const tela =
        document.getElementById(
            "tvConteudo"
        );

    if (!tela) {
        return;
    }

    tela.style.display =
        "flex";

    tela.innerHTML = `
        <div
            style="
                width:100%;
                height:100%;
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                text-align:center;
                color:white;
                font-family:Arial,sans-serif;
                padding:40px;
                box-sizing:border-box;
            "
        >

            <h1>
                TV Corporativa
            </h1>

            <p>
                ${
                    this.escapeHTML(
                        mensagem
                    )
                }
            </p>

            <small
                style="
                    opacity:.7;
                    margin-top:10px;
                "
            >
                Verifique o banco de programação
                e os arquivos da pasta videos.
            </small>

        </div>
    `;

    if (erro) {

        console.error(
            "Detalhes do erro:",
            erro
        );

    }

},

// ========================================================
// LIMPAR TELA
// ========================================================

limparTela() {

    const tela =
        document.getElementById(
            "tvConteudo"
        );

    if (tela) {

        tela.innerHTML =
            "";

        tela.style.display =
            "none";

    }

},

// ========================================================
// ADICIONAR CACHE
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

},

// ========================================================
// SEGURANÇA HTML
// ========================================================

escapeHTML(
    valor
) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }

    return String(
        valor
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

},

// ========================================================
// SEGURANÇA DE ATRIBUTO
// ========================================================

escapeAttribute(
    valor
) {

    return this.escapeHTML(
        valor
    );

}

};

// ============================================================
// COMPATIBILIDADE GLOBAL
// ============================================================

window.TVCorporativa =
    TVCorporativa;

// ============================================================
// INICIAR QUANDO A PÁGINA CARREGAR
// ============================================================

window.addEventListener(
    "load",
    () => {

        TVCorporativa.iniciar();

    }
);