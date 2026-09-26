// ============================================================
// TV CORPORATIVA
// APP PRINCIPAL
// GITHUB PAGES
// ============================================================

const TVApp = {

    // ========================================================
    // INICIAR
    // ========================================================

    iniciar() {

        console.log(
            "======================================"
        );

        console.log(
            "TV CORPORATIVA"
        );

        console.log(
            "APP INICIADO"
        );

        console.log(
            "======================================"
        );


        // ====================================================
        // VERIFICAR PLAYER
        // ====================================================

        if (!window.PlayerTV) {

            console.error(
                "PlayerTV não foi carregado."
            );

            return;

        }


        // ====================================================
        // PROGRAMAÇÃO DE TESTE
        // ====================================================

        const programacao = [

            {
                id: "video01",

                tipo: "video",

                nome: "Vídeo 01",

                arquivoLocal: "video1.mp4",

                ordem: 1,

                ativo: true,

                publicado: true
            },


            {
                id: "video02",

                tipo: "video",

                nome: "Vídeo 02",

                arquivoLocal: "video2.mp4",

                ordem: 2,

                ativo: true,

                publicado: true
            }

        ];


        console.log(
            "Programação enviada ao PlayerTV:"
        );

        console.log(
            programacao
        );


        // ====================================================
        // INICIAR PLAYER
        // ====================================================

        PlayerTV.iniciar(
            programacao
        );

    }

};


// ============================================================
// QUANDO A PÁGINA CARREGAR
// ============================================================

window.addEventListener(
    "load",
    () => {

        TVApp.iniciar();

    }
);