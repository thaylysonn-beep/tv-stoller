const TVApp = {

    versaoAtual: 0,

    iniciar() {

        console.log(
            "TV Corporativa 1.0"
        );


        this.carregar();

    },


    async carregar() {

        const dados =
            await DatabaseTV
                .carregarProgramacao();


        if (!dados) {

            return;

        }


        this.versaoAtual =
            dados.versao || 0;


        PlayerTV.iniciar(
            dados.programacao || []
        );

    }

};


window.addEventListener(
    "load",
    () => {

        TVApp.iniciar();

    }
);