// ============================================================
// PORTAL TV CORPORATIVA
// PLAYER TV
// ============================================================

const PlayerTV = {

    // ========================================================
    // CONFIGURAÇÕES
    // ========================================================

    programacao: [],

    indice: 0,

    timer: null,

    carregando: false,

    video: null,

    imagem: null,

    web: null,

    loading: null,

    inicializado: false,

    // Pasta dos vídeos
    pastaVideos: "videos/",


    // ========================================================
    // ELEMENTOS
    // ========================================================

    inicializarElementos() {

        this.video =
            document.getElementById(
                "videoPlayer"
            );

        this.imagem =
            document.getElementById(
                "imagePlayer"
            );

        this.web =
            document.getElementById(
                "webPlayer"
            );

        this.loading =
            document.getElementById(
                "loading"
            );
    },


    // ========================================================
    // INICIAR
    // ========================================================

    async iniciar(programacao = null) {

        if (this.inicializado) {
            return;
        }

        this.inicializado = true;

        console.log(
            "===================================="
        );

        console.log(
            "PLAYER TV - INICIANDO"
        );

        console.log(
            "===================================="
        );

        this.inicializarElementos();

        clearTimeout(this.timer);

        this.indice = 0;

        this.esconderTudo();


        // ----------------------------------------------------
        // PROGRAMAÇÃO RECEBIDA DIRETAMENTE
        // ----------------------------------------------------

        if (
            Array.isArray(programacao) &&
            programacao.length
        ) {

            console.log(
                "Programação recebida diretamente:",
                programacao
            );

            this.programacao =
                this.normalizarProgramacao(
                    programacao
                );

        }

        // ----------------------------------------------------
        // CARREGAR DO DATABASE TV
        // ----------------------------------------------------

        else {

            await this.carregarDatabaseTV();

        }


        console.log(
            "PlayerTV - programação final:",
            this.programacao
        );


        // ----------------------------------------------------
        // NENHUMA PROGRAMAÇÃO
        // ----------------------------------------------------

        if (!this.programacao.length) {

            this.mostrarSemProgramacao();

            return;
        }


        // ----------------------------------------------------
        // COMEÇAR REPRODUÇÃO
        // ----------------------------------------------------

        this.esconderLoading();

        this.tocarAtual();
    },


    // ========================================================
    // CARREGAR DATABASE TV
    // ========================================================

    async carregarDatabaseTV() {

        this.mostrarLoading(
            "Carregando programação..."
        );

        try {

            if (!window.DatabaseTV) {

                throw new Error(
                    "DatabaseTV não está disponível."
                );
            }


            let dados = null;

            // ------------------------------------------------
            // CARREGAR PROGRAMAÇÃO
            // ------------------------------------------------

            if (
                typeof DatabaseTV.carregarProgramacao ===
                "function"
            ) {

                dados =
                    await DatabaseTV.carregarProgramacao();

                console.log(
                    "DatabaseTV.carregarProgramacao:",
                    dados
                );
            }


            // ------------------------------------------------
            // OBTER PROGRAMAÇÃO ORDENADA
            // ------------------------------------------------

            let lista = [];


            if (
                typeof DatabaseTV.obterProgramacaoOrdenada ===
                "function"
            ) {

                try {

                    lista =
                        DatabaseTV.obterProgramacaoOrdenada();

                    console.log(
                        "Programação ordenada:",
                        lista
                    );

                }
                catch (erro) {

                    console.warn(
                        "Não foi possível obter programação ordenada:",
                        erro
                    );
                }
            }


            // ------------------------------------------------
            // FALLBACK PARA dados.programacao
            // ------------------------------------------------

            if (
                !lista.length &&
                dados &&
                Array.isArray(
                    dados.programacao
                )
            ) {

                lista =
                    dados.programacao;
            }


            // ------------------------------------------------
            // OUTRAS ESTRUTURAS POSSÍVEIS
            // ------------------------------------------------

            if (
                !lista.length &&
                dados &&
                dados.dados &&
                Array.isArray(
                    dados.dados.programacao
                )
            ) {

                lista =
                    dados.dados.programacao;
            }


            if (
                !lista.length &&
                dados &&
                dados.banco &&
                Array.isArray(
                    dados.banco.programacao
                )
            ) {

                lista =
                    dados.banco.programacao;
            }


            // ------------------------------------------------
            // NORMALIZAR
            // ------------------------------------------------

            this.programacao =
                this.normalizarProgramacao(
                    lista
                );


            // ------------------------------------------------
            // FALLBACK LOCALSTORAGE
            // ------------------------------------------------

            if (!this.programacao.length) {

                const local =
                    this.carregarProgramacaoLocal();

                if (
                    local &&
                    local.length
                ) {

                    console.warn(
                        "PlayerTV utilizando programação local."
                    );

                    this.programacao =
                        this.normalizarProgramacao(
                            local
                        );
                }
            }

        }

        catch (erro) {

            console.error(
                "Erro ao carregar DatabaseTV:",
                erro
            );


            // ------------------------------------------------
            // TENTAR LOCALSTORAGE
            // ------------------------------------------------

            const local =
                this.carregarProgramacaoLocal();


            if (
                local &&
                local.length
            ) {

                console.warn(
                    "Utilizando programação local como fallback."
                );

                this.programacao =
                    this.normalizarProgramacao(
                        local
                    );

            }

            else {

                this.programacao = [];

            }
        }
    },


    // ========================================================
    // FALLBACK LOCAL
    // ========================================================

    carregarProgramacaoLocal() {

        try {

            const salvo =
                localStorage.getItem(
                    "portal_tv_corporativa"
                );


            if (!salvo) {

                return [];
            }


            const banco =
                JSON.parse(
                    salvo
                );


            if (
                !banco ||
                !Array.isArray(
                    banco.programacao
                )
            ) {

                return [];
            }


            const programacao =
                banco.programacao.map(
                    item => {

                        if (!item) {
                            return null;
                        }


                        let conteudo =
                            null;


                        // ------------------------------------
                        // VÍDEO
                        // ------------------------------------

                        if (
                            item.tipo ===
                            "video"
                        ) {

                            conteudo =
                                (
                                    banco.videos ||
                                    []
                                ).find(
                                    video =>
                                        video.id ===
                                        item.conteudoId
                                );
                        }


                        // ------------------------------------
                        // COMUNICADO
                        // ------------------------------------

                        if (
                            item.tipo ===
                            "comunicado"
                        ) {

                            conteudo =
                                (
                                    banco.comunicados ||
                                    []
                                ).find(
                                    comunicado =>
                                        comunicado.id ===
                                        item.conteudoId
                                );
                        }


                        // ------------------------------------
                        // POWER BI
                        // ------------------------------------

                        if (
                            item.tipo ===
                            "powerbi"
                        ) {

                            conteudo =
                                (
                                    banco.powerbi ||
                                    []
                                ).find(
                                    power =>
                                        power.id ===
                                        item.conteudoId
                                );
                        }


                        // ------------------------------------
                        // RETORNAR ITEM
                        // ------------------------------------

                        return {

                            ...item,

                            nome:
                                item.nome ||
                                conteudo?.nome ||
                                conteudo?.titulo ||
                                "Sem nome",

                            titulo:
                                item.titulo ||
                                conteudo?.titulo ||
                                conteudo?.nome ||
                                "",

                            url:
                                item.url ||
                                conteudo?.url ||
                                "",

                            arquivo:
                                item.arquivo ||
                                item.arquivoLocal ||
                                conteudo?.arquivo ||
                                conteudo?.arquivoLocal ||
                                "",

                            arquivoLocal:
                                item.arquivoLocal ||
                                conteudo?.arquivoLocal ||
                                "",

                            imagem:
                                item.imagem ||
                                conteudo?.imagem ||
                                "",

                            mensagem:
                                item.mensagem ||
                                conteudo?.mensagem ||
                                "",

                            duracao:
                                item.duracao ??
                                conteudo?.duracao ??
                                10,

                            ativo:
                                item.ativo !== false,

                            publicado:
                                item.publicado !== false
                        };
                    }
                )
                .filter(
                    item => item !== null
                );


            return programacao;

        }

        catch (erro) {

            console.error(
                "Erro no fallback local:",
                erro
            );

            return [];
        }
    },


    // ========================================================
    // NORMALIZAR PROGRAMAÇÃO
    // ========================================================

    normalizarProgramacao(lista) {

        if (
            !Array.isArray(lista)
        ) {

            return [];
        }


        return lista

            .filter(
                item =>
                    item &&
                    item.ativo !== false &&
                    item.publicado !== false
            )

            .map(
                item => {

                    return {

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
                                item.contentType ||
                                item.tipoConteudo ||
                                ""
                            )
                            .toLowerCase()
                            .trim(),

                        nome:
                            item.nome ||
                            item.titulo ||
                            item.name ||
                            "Sem nome",

                        titulo:
                            item.titulo ||
                            item.nome ||
                            "",

                        url:
                            item.url ||
                            item.URL ||
                            item.src ||
                            "",

                        arquivo:
                            item.arquivo ||
                            "",

                        arquivoLocal:
                            item.arquivoLocal ||
                            item.nomeArquivo ||
                            item.fileName ||
                            item.filename ||
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
                            null,

                        dataFim:
                            item.dataFim ||
                            null,

                        horaInicio:
                            item.horaInicio ||
                            null,

                        horaFim:
                            item.horaFim ||
                            null
                    };
                }
            )

            .sort(
                (a, b) =>
                    a.ordem -
                    b.ordem
            );
    },


    // ========================================================
    // TOCAR ITEM ATUAL
    // ========================================================

    tocarAtual() {

        clearTimeout(
            this.timer
        );


        if (
            !this.programacao.length
        ) {

            this.mostrarSemProgramacao();

            return;
        }


        // ----------------------------------------------------
        // GARANTIR ÍNDICE VÁLIDO
        // ----------------------------------------------------

        if (
            this.indice < 0 ||
            this.indice >=
            this.programacao.length
        ) {

            this.indice = 0;
        }


        const item =
            this.programacao[
                this.indice
            ];


        if (!item) {

            this.proximo();

            return;
        }


        // ----------------------------------------------------
        // VERIFICAR DATA/HORÁRIO
        // ----------------------------------------------------

        if (
            !this.itemPodeSerExibido(
                item
            )
        ) {

            console.log(
                "Item fora do período:",
                item.nome
            );

            this.proximo();

            return;
        }


        console.log(
            "===================================="
        );

        console.log(
            "Reproduzindo:",
            item.nome
        );

        console.log(
            "Tipo:",
            item.tipo
        );

        console.log(
            "Ordem:",
            item.ordem
        );

        console.log(
            "===================================="
        );


        this.esconderTudo();


        // ----------------------------------------------------
        // VÍDEO
        // ----------------------------------------------------

        if (
            item.tipo ===
            "video"
        ) {

            this.tocarVideo(
                item
            );

            return;
        }


        // ----------------------------------------------------
        // IMAGEM
        // ----------------------------------------------------

        if (
            item.tipo ===
                "imagem" ||
            item.tipo ===
                "comunicado"
        ) {

            this.tocarImagem(
                item
            );

            return;
        }


        // ----------------------------------------------------
        // POWER BI
        // ----------------------------------------------------

        if (
            item.tipo ===
                "powerbi" ||
            item.tipo ===
                "web"
        ) {

            this.tocarWeb(
                item
            );

            return;
        }


        // ----------------------------------------------------
        // TIPO NÃO RECONHECIDO
        // ----------------------------------------------------

        console.warn(
            "Tipo não reconhecido:",
            item.tipo,
            item
        );


        this.proximo();
    },


    // ========================================================
    // TOCAR VÍDEO
    // ========================================================

    tocarVideo(item) {

        if (!this.video) {

            this.inicializarElementos();
        }


        if (!this.video) {

            this.mostrarErro(
                "Elemento #videoPlayer não encontrado."
            );

            return;
        }


        // ----------------------------------------------------
        // MONTAR URL
        // ----------------------------------------------------

        const url =
            this.montarUrlVideo(
                item
            );


        console.log(
            "Caminho final do vídeo:",
            url
        );


        if (!url) {

            this.mostrarErro(
                "O vídeo não possui um arquivo válido."
            );

            setTimeout(
                () => {
                    this.proximo();
                },
                2000
            );

            return;
        }


        // ----------------------------------------------------
        // ESCONDER OUTROS ELEMENTOS
        // ----------------------------------------------------

        if (this.imagem) {

            this.imagem.style.display =
                "none";
        }

        if (this.web) {

            this.web.style.display =
                "none";
        }


        // ----------------------------------------------------
        // LIMPAR VÍDEO ANTERIOR
        // ----------------------------------------------------

        try {

            this.video.pause();

        }
        catch (erro) {

            console.warn(
                "Erro ao pausar vídeo anterior:",
                erro
            );
        }


        this.video.removeAttribute(
            "src"
        );

        this.video.load();


        // ----------------------------------------------------
        // CONFIGURAR PLAYER
        // ----------------------------------------------------

        this.video.style.display =
            "block";

        this.video.controls =
            false;

        this.video.autoplay =
            true;

        this.video.muted =
            true;

        this.video.playsInline =
            true;


        this.video.setAttribute(
            "playsinline",
            ""
        );


        this.video.setAttribute(
            "webkit-playsinline",
            ""
        );


        // ----------------------------------------------------
        // EVENTO FINAL
        // ----------------------------------------------------

        this.video.onended =
            () => {

                console.log(
                    "Vídeo finalizado:",
                    item.nome
                );

                this.proximo();
            };


        // ----------------------------------------------------
        // EVENTO ERRO
        // ----------------------------------------------------

        this.video.onerror =
            () => {

                console.error(
                    "Erro ao reproduzir vídeo:",
                    this.video.error
                );

                console.error(
                    "URL utilizada:",
                    url
                );

                this.mostrarErro(
                    "Não foi possível reproduzir o vídeo."
                );


                setTimeout(
                    () => {

                        this.proximo();

                    },
                    3000
                );
            };


        // ----------------------------------------------------
        // QUANDO CARREGAR
        // ----------------------------------------------------

        this.video.onloadeddata =
            () => {

                console.log(
                    "Vídeo carregado:"
                );

                this.esconderLoading();


                const promessa =
                    this.video.play();


                if (
                    promessa &&
                    typeof promessa.catch ===
                    "function"
                ) {

                    promessa.catch(
                        erro => {

                            console.warn(
                                "Autoplay bloqueado:",
                                erro
                            );

                        }
                    );
                }
            };


        // ----------------------------------------------------
        // ADICIONAR CACHE
        // ----------------------------------------------------

        const urlFinal =
            this.adicionarCache(
                url
            );


        console.log(
            "URL final:",
            urlFinal
        );


        // ----------------------------------------------------
        // DEFINIR VÍDEO
        // ----------------------------------------------------

        this.video.src =
            urlFinal;


        // ----------------------------------------------------
        // CARREGAR
        // ----------------------------------------------------

        this.mostrarLoading(
            "Carregando vídeo..."
        );


        this.video.load();


        // ----------------------------------------------------
        // TENTAR REPRODUZIR
        // ----------------------------------------------------

        setTimeout(
            () => {

                const promessa =
                    this.video.play();


                if (
                    promessa &&
                    typeof promessa.catch ===
                    "function"
                ) {

                    promessa.catch(
                        erro => {

                            console.warn(
                                "Não foi possível iniciar automaticamente:",
                                erro
                            );

                        }
                    );
                }

            },
            300
        );
    },


    // ========================================================
    // MONTAR URL DO VÍDEO
    // ========================================================

    montarUrlVideo(item) {

        if (!item) {

            return "";
        }


        // ----------------------------------------------------
        // POSSÍVEIS CAMPOS
        // ----------------------------------------------------

        const valores = [

            item.arquivoLocal,

            item.nomeArquivo,

            item.fileName,

            item.filename,

            item.arquivo,

            item.url,

            item.src
        ];


        for (
            const valor of valores
        ) {

            if (!valor) {

                continue;
            }


            let texto =
                String(
                    valor
                ).trim();


            if (!texto) {

                continue;
            }


            // ------------------------------------------------
            // URL ABSOLUTA
            // ------------------------------------------------

            if (
                /^https?:\/\//i.test(
                    texto
                )
            ) {

                return texto;
            }


            // ------------------------------------------------
            // CAMINHO ABSOLUTO
            // ------------------------------------------------

            if (
                texto.startsWith("/")
            ) {

                return texto;
            }


            // ------------------------------------------------
            // REMOVER ./ INICIAL
            // ------------------------------------------------

            texto =
                texto.replace(
                    /^\.\/+/,
                    ""
                );


            // ------------------------------------------------
            // NORMALIZAR BARRAS
            // ------------------------------------------------

            texto =
                texto.replace(
                    /\\/g,
                    "/"
                );


            // ------------------------------------------------
            // JÁ ESTÁ NA PASTA VIDEOS
            // ------------------------------------------------

            if (
                /^videos\//i.test(
                    texto
                )
            ) {

                return texto
                    .split("/")
                    .map(
                        parte =>
                            encodeURIComponent(
                                decodeURIComponent(
                                    parte
                                )
                            )
                    )
                    .join("/");
            }


            // ------------------------------------------------
            // PEGAR SOMENTE O NOME DO ARQUIVO
            // ------------------------------------------------

            const nomeArquivo =
                texto
                    .split("/")
                    .pop();


            if (!nomeArquivo) {

                continue;
            }


            // ------------------------------------------------
            // MONTAR CAMINHO LOCAL
            // ------------------------------------------------

            return (
                this.pastaVideos +
                encodeURIComponent(
                    nomeArquivo
                )
            );
        }


        return "";
    },


    // ========================================================
    // TOCAR IMAGEM / COMUNICADO
    // ========================================================

    tocarImagem(item) {

        if (!this.imagem) {

            this.inicializarElementos();
        }


        if (!this.imagem) {

            this.mostrarErro(
                "Elemento #imagePlayer não encontrado."
            );

            setTimeout(
                () => {
                    this.proximo();
                },
                1500
            );

            return;
        }


        // ----------------------------------------------------
        // URL
        // ----------------------------------------------------

        const url =
            item.imagem ||
            item.arquivo ||
            item.url ||
            "";


        if (!url) {

            console.warn(
                "Imagem sem URL:",
                item
            );

            this.proximo();

            return;
        }


        // ----------------------------------------------------
        // ESCONDER OUTROS
        // ----------------------------------------------------

        if (this.video) {

            this.video.pause();

            this.video.style.display =
                "none";
        }

        if (this.web) {

            this.web.style.display =
                "none";
        }


        // ----------------------------------------------------
        // CONFIGURAR IMAGEM
        // ----------------------------------------------------

        this.imagem.style.display =
            "block";


        this.imagem.src =
            this.adicionarCache(
                this.converterURL(
                    url
                )
            );


        this.imagem.onerror =
            () => {

                console.error(
                    "Erro ao carregar imagem:",
                    url
                );

                this.proximoComAtraso(
                    1500
                );
            };


        this.esconderLoading();


        // ----------------------------------------------------
        // DURAÇÃO
        // ----------------------------------------------------

        const segundos =
            Number(
                item.duracao
            ) || 10;


        this.timer =
            setTimeout(
                () => {

                    this.proximo();

                },
                segundos * 1000
            );
    },


    // ========================================================
    // TOCAR WEB / POWER BI
    // ========================================================

    tocarWeb(item) {

        if (!this.web) {

            this.inicializarElementos();
        }


        if (!this.web) {

            this.mostrarErro(
                "Elemento #webPlayer não encontrado."
            );

            setTimeout(
                () => {
                    this.proximo();
                },
                1500
            );

            return;
        }


        const url =
            item.url ||
            "";


        if (!url) {

            console.warn(
                "Conteúdo web sem URL:",
                item
            );

            this.proximo();

            return;
        }


        // ----------------------------------------------------
        // ESCONDER VÍDEO
        // ----------------------------------------------------

        if (this.video) {

            this.video.pause();

            this.video.style.display =
                "none";
        }


        if (this.imagem) {

            this.imagem.style.display =
                "none";
        }


        // ----------------------------------------------------
        // CONFIGURAR IFRAME
        // ----------------------------------------------------

        this.web.style.display =
            "block";


        this.web.src =
            this.adicionarCache(
                url
            );


        this.esconderLoading();


        // ----------------------------------------------------
        // DURAÇÃO
        // ----------------------------------------------------

        const segundos =
            Number(
                item.duracao
            ) || 120;


        this.timer =
            setTimeout(
                () => {

                    this.proximo();

                },
                segundos * 1000
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

            this.mostrarSemProgramacao();

            return;
        }


        this.indice++;


        if (
            this.indice >=
            this.programacao.length
        ) {

            this.indice = 0;
        }


        console.log(
            "Avançando para:",
            this.indice
        );


        this.tocarAtual();
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
    // VERIFICAR DATA / HORÁRIO
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
                    partes[1] || 0
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
                    partes[1] || 0
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
        // YYYY-MM-DD
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

                Number(
                    partes[0]
                ),

                Number(
                    partes[1]
                ) - 1,

                Number(
                    partes[2]
                ),

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
    // CONVERTER URL
    // ========================================================

    converterURL(url) {

        if (!url) {

            return "";
        }


        const texto =
            String(
                url
            ).trim();


        // URL absoluta
        if (
            /^https?:\/\//i.test(
                texto
            )
        ) {

            return texto;
        }


        // Caminho absoluto
        if (
            texto.startsWith("/")
        ) {

            return texto;
        }


        return texto;
    },


    // ========================================================
    // ESCONDER TUDO
    // ========================================================

    esconderTudo() {

        clearTimeout(
            this.timer
        );


        // ----------------------------------------------------
        // VÍDEO
        // ----------------------------------------------------

        if (this.video) {

            try {

                this.video.pause();

            }
            catch (erro) {

                console.warn(
                    erro
                );
            }


            this.video.style.display =
                "none";
        }


        // ----------------------------------------------------
        // IMAGEM
        // ----------------------------------------------------

        if (this.imagem) {

            this.imagem.style.display =
                "none";
        }


        // ----------------------------------------------------
        // WEB
        // ----------------------------------------------------

        if (this.web) {

            this.web.style.display =
                "none";
        }


        this.esconderLoading();
    },


    // ========================================================
    // LOADING
    // ========================================================

    mostrarLoading(mensagem) {

        if (!this.loading) {

            this.inicializarElementos();
        }


        if (!this.loading) {

            return;
        }


        this.loading.textContent =
            mensagem ||
            "Carregando...";


        this.loading.style.display =
            "flex";
    },


    esconderLoading() {

        if (!this.loading) {

            return;
        }


        this.loading.style.display =
            "none";
    },


    // ========================================================
    // SEM PROGRAMAÇÃO
    // ========================================================

    mostrarSemProgramacao() {

        this.esconderTudo();


        if (!this.loading) {

            this.inicializarElementos();
        }


        if (!this.loading) {

            return;
        }


        this.loading.textContent =
            "Nenhum conteúdo ativo na programação.";


        this.loading.style.display =
            "flex";
    },


    // ========================================================
    // ERRO
    // ========================================================

    mostrarErro(mensagem) {

        console.error(
            mensagem
        );


        this.esconderTudo();


        if (!this.loading) {

            this.inicializarElementos();
        }


        if (!this.loading) {

            return;
        }


        this.loading.textContent =
            mensagem ||
            "Erro ao reproduzir conteúdo.";


        this.loading.style.display =
            "flex";
    },


    // ========================================================
    // CACHE
    // ========================================================

    adicionarCache(url) {

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
// DISPONIBILIZAR GLOBALMENTE
// ============================================================

window.PlayerTV =
    PlayerTV;


// ============================================================
// INICIALIZAÇÃO
// ============================================================

window.addEventListener(
    "load",
    function() {

        console.log(
            "PlayerTV carregado."
        );

    }
);