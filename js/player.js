// ============================================================
// TV CORPORATIVA
// PLAYER TV - GITHUB PAGES
// ============================================================

const PlayerTV = {

    // ========================================================
    // CONFIGURAÇÃO
    // ========================================================

    programacao: [],

    indice: 0,

    timer: null,

    video: null,

    imagem: null,

    web: null,

    loading: null,

    inicializado: false,


    // ========================================================
    // PASTA DOS VÍDEOS
    // ========================================================

    pastaVideos: "videos/",


    // ========================================================
    // INICIALIZAR ELEMENTOS
    // ========================================================

    inicializarElementos() {

        this.video =
            document.getElementById("videoPlayer");

        this.imagem =
            document.getElementById("imagePlayer");

        this.web =
            document.getElementById("webPlayer");

        this.loading =
            document.getElementById("loading");

    },


    // ========================================================
    // INICIAR PLAYER
    // ========================================================

    iniciar(programacao = []) {

        console.log(
            "======================================"
        );

        console.log(
            "TV CORPORATIVA"
        );

        console.log(
            "PLAYER GITHUB PAGES"
        );

        console.log(
            "======================================"
        );


        this.inicializarElementos();


        if (!this.video) {

            console.error(
                "Elemento #videoPlayer não encontrado."
            );

            return;
        }


        clearTimeout(this.timer);


        this.indice = 0;


        this.programacao =
            this.normalizarProgramacao(
                programacao
            );


        console.log(
            "Programação carregada:",
            this.programacao
        );


        if (!this.programacao.length) {

            this.mostrarErro(
                "Nenhum vídeo foi configurado."
            );

            return;
        }


        this.tocarAtual();

    },


    // ========================================================
    // NORMALIZAR PROGRAMAÇÃO
    // ========================================================

    normalizarProgramacao(lista) {

        if (!Array.isArray(lista)) {

            return [];

        }


        return lista

            .filter(item => {

                return (
                    item &&
                    item.ativo !== false &&
                    item.publicado !== false
                );

            })

            .sort((a, b) => {

                return (
                    Number(a.ordem || 0) -
                    Number(b.ordem || 0)
                );

            });

    },


    // ========================================================
    // TOCAR ITEM ATUAL
    // ========================================================

    tocarAtual() {

        clearTimeout(this.timer);


        if (!this.programacao.length) {

            this.mostrarErro(
                "Nenhum conteúdo disponível."
            );

            return;
        }


        if (
            this.indice < 0 ||
            this.indice >= this.programacao.length
        ) {

            this.indice = 0;

        }


        const item =
            this.programacao[this.indice];


        console.log(
            "--------------------------------------"
        );

        console.log(
            "Reproduzindo:",
            item.nome
        );

        console.log(
            "Arquivo:",
            item.arquivoLocal
        );

        console.log(
            "--------------------------------------"
        );


        this.esconderTudo();


        // ====================================================
        // VÍDEO
        // ====================================================

        if (
            item.tipo === "video"
        ) {

            this.tocarVideo(item);

            return;
        }


        // ====================================================
        // IMAGEM
        // ====================================================

        if (
            item.tipo === "imagem" ||
            item.tipo === "comunicado"
        ) {

            this.tocarImagem(item);

            return;
        }


        // ====================================================
        // WEB
        // ====================================================

        if (
            item.tipo === "web" ||
            item.tipo === "powerbi"
        ) {

            this.tocarWeb(item);

            return;
        }


        console.warn(
            "Tipo não reconhecido:",
            item.tipo
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
                "Player de vídeo não encontrado."
            );

            return;

        }


        const url =
            this.montarUrlVideo(item);


        console.log(
            "URL do vídeo:",
            url
        );


        if (!url) {

            this.mostrarErro(
                "Vídeo sem arquivo."
            );

            setTimeout(() => {

                this.proximo();

            }, 2000);

            return;

        }


        // ====================================================
        // ESCONDER OUTROS ELEMENTOS
        // ====================================================

        if (this.imagem) {

            this.imagem.style.display =
                "none";

        }


        if (this.web) {

            this.web.style.display =
                "none";

        }


        // ====================================================
        // PARAR VÍDEO ANTERIOR
        // ====================================================

        try {

            this.video.pause();

        }
        catch (erro) {

            console.warn(
                "Erro ao pausar vídeo:",
                erro
            );

        }


        // ====================================================
        // LIMPAR EVENTOS
        // ====================================================

        this.video.onended = null;

        this.video.onerror = null;

        this.video.onloadeddata = null;


        // ====================================================
        // CONFIGURAÇÕES
        // ====================================================

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


        // ====================================================
        // EVENTO FINAL
        // ====================================================

        this.video.onended =
            () => {

                console.log(
                    "Vídeo finalizado:",
                    item.nome
                );


                this.proximo();

            };


        // ====================================================
        // EVENTO DE ERRO
        // ====================================================

        this.video.onerror =
            () => {

                console.error(
                    "======================================"
                );

                console.error(
                    "ERRO AO REPRODUZIR VÍDEO"
                );

                console.error(
                    "URL:",
                    url
                );

                console.error(
                    "Erro:",
                    this.video.error
                );

                console.error(
                    "======================================"
                );


                this.mostrarErro(
                    "Erro ao carregar vídeo."
                );


                setTimeout(() => {

                    this.proximo();

                }, 3000);

            };


        // ====================================================
        // VÍDEO CARREGADO
        // ====================================================

        this.video.onloadeddata =
            () => {

                console.log(
                    "Vídeo carregado com sucesso:"
                );

                console.log(
                    url
                );


                this.esconderLoading();


                const promessa =
                    this.video.play();


                if (
                    promessa &&
                    typeof promessa.catch ===
                    "function"
                ) {

                    promessa.catch(erro => {

                        console.warn(
                            "Autoplay bloqueado:",
                            erro
                        );

                    });

                }

            };


        // ====================================================
        // CACHE
        // ====================================================

        const urlFinal =
            this.adicionarCache(url);


        console.log(
            "URL final:",
            urlFinal
        );


        // ====================================================
        // DEFINIR SRC
        // ====================================================

        this.video.src =
            urlFinal;


        // ====================================================
        // LOADING
        // ====================================================

        this.mostrarLoading(
            "Carregando vídeo..."
        );


        // ====================================================
        // CARREGAR
        // ====================================================

        this.video.load();


        // ====================================================
        // TENTAR PLAY
        // ====================================================

        setTimeout(() => {

            const promessa =
                this.video.play();


            if (
                promessa &&
                typeof promessa.catch ===
                "function"
            ) {

                promessa.catch(erro => {

                    console.warn(
                        "Não foi possível iniciar automaticamente:",
                        erro
                    );

                });

            }

        }, 500);

    },


    // ========================================================
    // MONTAR URL DO VÍDEO
    // ========================================================

    montarUrlVideo(item) {

        if (!item) {

            return "";

        }


        let arquivo =
            item.arquivoLocal ||
            item.nomeArquivo ||
            item.fileName ||
            item.filename ||
            item.arquivo ||
            item.url ||
            "";


        if (!arquivo) {

            return "";

        }


        arquivo =
            String(arquivo).trim();


        if (!arquivo) {

            return "";

        }


        // ====================================================
        // URL ABSOLUTA
        // ====================================================

        if (
            /^https?:\/\//i.test(arquivo)
        ) {

            return arquivo;

        }


        // ====================================================
        // REMOVER ./ 
        // ====================================================

        arquivo =
            arquivo.replace(
                /^\.\//,
                ""
            );


        // ====================================================
        // NORMALIZAR BARRAS
        // ====================================================

        arquivo =
            arquivo.replace(
                /\\/g,
                "/"
            );


        // ====================================================
        // SE JÁ POSSUI videos/
        // ====================================================

        if (
            /^videos\//i.test(arquivo)
        ) {

            return this.codificarCaminho(
                arquivo
            );

        }


        // ====================================================
        // PEGAR SOMENTE NOME DO ARQUIVO
        // ====================================================

        const partes =
            arquivo.split("/");


        const nomeArquivo =
            partes[partes.length - 1];


        if (!nomeArquivo) {

            return "";

        }


        // ====================================================
        // MONTAR CAMINHO
        // ====================================================

        return (
            this.pastaVideos +
            encodeURIComponent(
                nomeArquivo
            )
        );

    },


    // ========================================================
    // CODIFICAR CAMINHO
    // ========================================================

    codificarCaminho(caminho) {

        return caminho
            .split("/")
            .map(parte => {

                try {

                    return encodeURIComponent(
                        decodeURIComponent(parte)
                    );

                }
                catch (erro) {

                    return encodeURIComponent(
                        parte
                    );

                }

            })
            .join("/");

    },


    // ========================================================
    // IMAGEM
    // ========================================================

    tocarImagem(item) {

        if (!this.imagem) {

            this.inicializarElementos();

        }


        if (!this.imagem) {

            this.proximoComAtraso();

            return;

        }


        const url =
            item.imagem ||
            item.arquivo ||
            item.url ||
            "";


        if (!url) {

            this.proximo();

            return;

        }


        if (this.video) {

            this.video.pause();

            this.video.style.display =
                "none";

        }


        if (this.web) {

            this.web.style.display =
                "none";

        }


        this.imagem.style.display =
            "block";


        this.imagem.src =
            this.adicionarCache(url);


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


        this.imagem.onload =
            () => {

                this.esconderLoading();

            };


        const segundos =
            Number(item.duracao) || 10;


        this.timer =
            setTimeout(() => {

                this.proximo();

            }, segundos * 1000);

    },


    // ========================================================
    // WEB
    // ========================================================

    tocarWeb(item) {

        if (!this.web) {

            this.inicializarElementos();

        }


        if (!this.web) {

            this.proximoComAtraso();

            return;

        }


        const url =
            item.url || "";


        if (!url) {

            this.proximo();

            return;

        }


        if (this.video) {

            this.video.pause();

            this.video.style.display =
                "none";

        }


        if (this.imagem) {

            this.imagem.style.display =
                "none";

        }


        this.web.style.display =
            "block";


        this.web.src =
            this.adicionarCache(url);


        this.esconderLoading();


        const segundos =
            Number(item.duracao) || 120;


        this.timer =
            setTimeout(() => {

                this.proximo();

            }, segundos * 1000);

    },


    // ========================================================
    // PRÓXIMO
    // ========================================================

    proximo() {

        clearTimeout(
            this.timer
        );


        if (!this.programacao.length) {

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
            "Próximo conteúdo:",
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
            setTimeout(() => {

                this.proximo();

            }, atraso);

    },


    // ========================================================
    // ESCONDER TUDO
    // ========================================================

    esconderTudo() {

        clearTimeout(
            this.timer
        );


        if (this.video) {

            try {

                this.video.pause();

            }
            catch (erro) {}

            this.video.style.display =
                "none";

        }


        if (this.imagem) {

            this.imagem.style.display =
                "none";

        }


        if (this.web) {

            this.web.style.display =
                "none";

        }


        this.esconderLoading();

    },


    // ========================================================
    // LOADING
    // ========================================================

    mostrarLoading(
        mensagem = "Carregando..."
    ) {

        if (!this.loading) {

            this.inicializarElementos();

        }


        if (!this.loading) {

            return;

        }


        const mensagemElemento =
            document.getElementById(
                "loadingMessage"
            );


        if (mensagemElemento) {

            mensagemElemento.textContent =
                mensagem;

        }
        else {

            this.loading.textContent =
                mensagem;

        }


        this.loading.style.display =
            "flex";

    },


    // ========================================================
    // ESCONDER LOADING
    // ========================================================

    esconderLoading() {

        if (!this.loading) {

            return;

        }


        this.loading.style.display =
            "none";

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


        const mensagemElemento =
            document.getElementById(
                "loadingMessage"
            );


        if (mensagemElemento) {

            mensagemElemento.textContent =
                mensagem;

        }
        else {

            this.loading.textContent =
                mensagem;

        }


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
// CONFIRMAÇÃO
// ============================================================

console.log(
    "PlayerTV carregado com sucesso."
);