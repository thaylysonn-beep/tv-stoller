// ============================================================
// PORTAL TV CORPORATIVA
// APP DO PLAYER - GITHUB PAGES
// ============================================================

const TVApp = {

    // ========================================================
    // CONFIGURAÇÕES
    // ========================================================

    versaoAtual: 1,

    // ========================================================
    // PROGRAMAÇÃO PUBLICADA NO GITHUB
    // ========================================================

    programacaoPublicada: [

        {
            id: "video-01",

            conteudoId: "video-01",

            tipo: "video",

            nome: "Vídeo 01",

            titulo: "Vídeo 01",

            arquivoLocal: "videos/video1.mp4",

            arquivo: "videos/video1.mp4",

            url: "videos/video1.mp4",

            duracao: 0,

            ordem: 1,

            ativo: true,

            publicado: true
        },

        {
            id: "video-02",

            conteudoId: "video-02",

            tipo: "video",

            nome: "Vídeo 02",

            titulo: "Vídeo 02",

            arquivoLocal: "videos/video2.mp4",

            arquivo: "videos/video2.mp4",

            url: "videos/video2.mp4",

            duracao: 0,

            ordem: 2,

            ativo: true,

            publicado: true
        }

    ],


    // ========================================================
    // INICIAR
    // ========================================================

    iniciar() {

        console.log(
            "===================================="
        );

        console.log(
            "TV CORPORATIVA"
        );

        console.log(
            "PLAYER GITHUB"
        );

        console.log(
            "===================================="
        );

        this.carregar();

    },


    // ========================================================
    // CARREGAR
    // ========================================================

    async carregar() {

        console.log(
            "Carregando programação publicada..."
        );


        // ----------------------------------------------------
        // PRIMEIRO TENTA DATABASE
        // ----------------------------------------------------

        try {

            if (
                window.DatabaseTV &&
                typeof DatabaseTV.carregarProgramacao ===
                "function"
            ) {

                const dados =
                    await DatabaseTV.carregarProgramacao();


                if (
                    dados &&
                    Array.isArray(
                        dados.programacao
                    ) &&
                    dados.programacao.length
                ) {

                    console.log(
                        "Programação carregada pelo DatabaseTV:",
                        dados.programacao
                    );


                    this.versaoAtual =
                        dados.versao || 0;


                    PlayerTV.iniciar(
                        dados.programacao
                    );

                    return;

                }

            }

        }
        catch (erro) {

            console.warn(
                "DatabaseTV não disponível:",
                erro
            );

        }


        // ----------------------------------------------------
        // FALLBACK GITHUB
        // ----------------------------------------------------

        console.log(
            "Utilizando programação publicada no GitHub."
        );


        console.log(
            this.programacaoPublicada
        );


        this.versaoAtual = 1;


        PlayerTV.iniciar(
            this.programacaoPublicada
        );

    }

};


// ============================================================
// DISPONIBILIZAR GLOBALMENTE
// ============================================================

window.TVApp = TVApp;


// ============================================================
// INICIAR
// ============================================================

window.addEventListener(
    "load",
    function() {

        TVApp.iniciar();

    }
);