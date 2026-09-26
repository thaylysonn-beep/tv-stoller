// ============================================================
// PORTAL TV CORPORATIVA
// PUBLICADOR
// ============================================================

const PublicadorTV = {

    configuracao: {

        arquivoPublicacao:
            "dados/programacao.json",

        chaveLocal:
            "tv_corporativa_publicacao",

        versao:
            "2.0"

    },


    estado: {

        carregando:
            false,

        publicando:
            false,

        ultimaPublicacao:
            null,

        versao:
            0,

        dados:
            null,

        erro:
            null

    },


    // ========================================================
    // INICIAR
    // ========================================================

    async iniciar() {

        try {

            await this.carregarBanco();

            this.carregarEstadoLocal();

        }
        catch (erro) {

            console.warn(
                "PublicadorTV:",
                erro.message
            );

        }

    },


    // ========================================================
    // CARREGAR BANCO
    // ========================================================

    async carregarBanco() {

        this.estado.carregando =
            true;


        try {

            let dados =
                null;


            if (
                window.DatabaseTV &&
                typeof DatabaseTV
                    .carregarBancoCompleto ===
                    "function"
            ) {

                dados =
                    await DatabaseTV
                        .carregarBancoCompleto();

            }
            else if (
                window.DatabaseTV &&
                typeof DatabaseTV
                    .carregarProgramacao ===
                    "function"
            ) {

                dados =
                    await DatabaseTV
                        .carregarProgramacao();

            }


            if (
                !dados
            ) {

                dados = {

                    versao:
                        0,

                    videos:
                        [],

                    comunicados:
                        [],

                    powerbi:
                        [],

                    programacao:
                        [],

                    publicado:
                        false

                };

            }


            this.estado.dados =
                dados;


            this.estado.versao =
                Number(
                    dados.versao
                ) || 0;


            return dados;

        }
        finally {

            this.estado.carregando =
                false;

        }

    },


    // ========================================================
    // ESTADO LOCAL
    // ========================================================

    carregarEstadoLocal() {

        try {

            const bruto =
                localStorage.getItem(
                    this.configuracao
                        .chaveLocal
                );


            if (
                !bruto
            ) {

                return;

            }


            const estado =
                JSON.parse(
                    bruto
                );


            if (
                estado &&
                typeof estado ===
                "object"
            ) {

                this.estado.ultimaPublicacao =
                    estado.ultimaPublicacao ||
                    null;


                this.estado.versao =
                    Math.max(
                        Number(
                            this.estado.versao
                        ) || 0,

                        Number(
                            estado.versao
                        ) || 0
                    );

            }

        }
        catch (erro) {

            console.warn(
                "Erro ao carregar estado local:",
                erro
            );

        }

    },


    salvarEstadoLocal() {

        try {

            localStorage.setItem(

                this.configuracao
                    .chaveLocal,

                JSON.stringify({

                    ultimaPublicacao:
                        this.estado
                            .ultimaPublicacao,

                    versao:
                        this.estado
                            .versao

                })

            );

        }
        catch (erro) {

            console.warn(
                "Não foi possível salvar estado local.",
                erro
            );

        }

    },


    // ========================================================
    // BANCO DO ADMIN
    // ========================================================

    receberBanco(
        banco
    ) {

        if (
            !banco ||
            typeof banco !==
            "object"
        ) {

            throw new Error(
                "Banco inválido."
            );

        }


        this.estado.dados =
            JSON.parse(
                JSON.stringify(
                    banco
                )
            );


        return this.estado.dados;

    },


    // ========================================================
    // VALIDAR
    // ========================================================

    validarProgramacao(
        programacao
    ) {

        if (
            !Array.isArray(
                programacao
            )
        ) {

            throw new Error(
                "A programação precisa ser uma lista."
            );

        }


        programacao.forEach(
            (item, indice) => {

                if (
                    !item.tipo
                ) {

                    throw new Error(
                        "Item " +
                        (indice + 1) +
                        " sem tipo."
                    );

                }


                if (
                    !item.conteudoId &&
                    !item.id
                ) {

                    throw new Error(
                        "Item " +
                        (indice + 1) +
                        " sem conteúdo."
                    );

                }


                if (
                    !item.nome
                ) {

                    throw new Error(
                        "Item " +
                        (indice + 1) +
                        " sem nome."
                    );

                }

            }
        );


        return true;

    },


    // ========================================================
    // PREPARAR PROGRAMAÇÃO
    // ========================================================

    prepararProgramacao(
        programacao
    ) {

        const lista =
            Array.isArray(
                programacao
            )
                ? programacao
                : [];


        const preparada =
            lista

                .filter(
                    item =>
                        item &&
                        item.ativo !== false
                )

                .sort(
                    (a, b) =>
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
                )

                .map(
                    item => ({

                        id:
                            item.id ||
                            this.gerarID(),

                        conteudoId:
                            item.conteudoId ||
                            item.id ||
                            "",

                        tipo:
                            item.tipo ||
                            "",

                        nome:
                            item.nome ||
                            item.titulo ||
                            "",

                        duracao:
                            Number(
                                item.duracao
                            ) ||
                            10000,

                        ordem:
                            Number(
                                item.ordem
                            ) ||
                            0,

                        ativo:
                            true,

                        publicado:
                            true,

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

                        url:
                            item.url ||
                            "",

                        titulo:
                            item.titulo ||
                            item.nome ||
                            "",

                        mensagem:
                            item.mensagem ||
                            "",

                        imagem:
                            item.imagem ||
                            "",

                        tvId:
                            item.tvId ||
                            null,

                        grupo:
                            item.grupo ||
                            null

                    })
                );


        return preparada;

    },


    // ========================================================
    // VERSÃO
    // ========================================================

    gerarVersao() {

        const atualBanco =
            Number(
                this.estado
                    .dados
                    ?.versao
            ) || 0;


        const atualLocal =
            Number(
                this.estado.versao
            ) || 0;


        return (
            Math.max(
                atualBanco,
                atualLocal
            ) + 1
        );

    },


    // ========================================================
    // MONTAR PUBLICAÇÃO
    // ========================================================

    montarPublicacao(
        banco
    ) {

        const agora =
            new Date()
                .toISOString();


        const versao =
            this.gerarVersao();


        const programacao =
            this.prepararProgramacao(
                banco.programacao
            );


        this.validarProgramacao(
            programacao
        );


        return {

            sistema:
                "Portal TV Corporativa",

            versaoSistema:
                this.configuracao
                    .versao,

            versao:
                versao,

            publicado:
                true,

            ultimaPublicacao:
                agora,

            ultimaAtualizacao:
                agora,

            videos:
                Array.isArray(
                    banco.videos
                )
                    ? banco.videos
                    : [],

            comunicados:
                Array.isArray(
                    banco.comunicados
                )
                    ? banco.comunicados
                    : [],

            powerbi:
                Array.isArray(
                    banco.powerbi
                )
                    ? banco.powerbi
                    : [],

            programacao:
                programacao

        };

    },


    // ========================================================
    // PUBLICAR
    // ========================================================

    async publicar(
        banco
    ) {

        if (
            this.estado.publicando
        ) {

            return {

                sucesso:
                    false,

                mensagem:
                    "Já existe uma publicação em andamento."

            };

        }


        this.estado.publicando =
            true;


        this.estado.erro =
            null;


        try {

            const dados =
                this.montarPublicacao(
                    banco
                );


            const json =
                JSON.stringify(
                    dados,
                    null,
                    4
                );


            /*
             * Atualizamos o estado antes do upload
             * para que o portal mantenha os dados atuais.
             */

            this.estado.dados =
                dados;


            this.estado.versao =
                dados.versao;


            /*
             * Tenta publicar diretamente no SharePoint.
             */

            let resultadoSharePoint =
                null;


            if (
                window.SharePointTV
            ) {

                resultadoSharePoint =
                    await this
                        .salvarJSONNoSharePoint(
                            json
                        );

            }
            else {

                throw new Error(
                    "SharePointTV não está disponível."
                );

            }


            this.estado
                .ultimaPublicacao =
                dados
                    .ultimaPublicacao;


            this.salvarEstadoLocal();


            window.dispatchEvent(

                new CustomEvent(
                    "tv-publicacao-realizada",
                    {

                        detail: {

                            dados:
                                dados,

                            resultado:
                                resultadoSharePoint

                        }

                    }
                )

            );


            return {

                sucesso:
                    true,

                mensagem:
                    "Publicação realizada com sucesso.",

                dados:
                    dados,

                resultado:
                    resultadoSharePoint

            };

        }
        catch (erro) {

            console.error(
                "Erro ao publicar:",
                erro
            );


            this.estado.erro =
                erro.message;


            /*
             * Mantém uma cópia para contingência.
             */

            try {

                this.baixarArquivo(
                    JSON.stringify(
                        this.estado.dados ||
                        banco,
                        null,
                        4
                    ),
                    "programacao.json"
                );

            }
            catch {}



            return {

                sucesso:
                    false,

                mensagem:
                    erro.message ||
                    "Erro ao publicar.",

                erro:
                    erro

            };

        }
        finally {

            this.estado.publicando =
                false;

        }

    },


    // ========================================================
    // SALVAR JSON NO SHAREPOINT
    // ========================================================

    async salvarJSONNoSharePoint(
        json
    ) {

        const sp =
            window.SharePointTV;


        if (
            !sp
        ) {

            throw new Error(
                "Integração SharePoint não carregada."
            );

        }


        sp.garantirInicializacao();


        const caminhoWeb =
            sp.estado
                .webServerRelativeUrl ||
            "";


        const caminhoArquivo =
            (
                caminhoWeb
                    .replace(
                        /\/$/,
                        ""
                    ) +
                "/" +
                this.configuracao
                    .arquivoPublicacao
            )
                .replace(
                    /\/+/g,
                    "/"
                );


        const ultimaBarra =
            caminhoArquivo
                .lastIndexOf("/");


        const pasta =
            caminhoArquivo.substring(
                0,
                ultimaBarra
            );


        const nomeArquivo =
            caminhoArquivo.substring(
                ultimaBarra + 1
            );


        const blob =
            new Blob(
                [
                    json
                ],
                {
                    type:
                        "application/json;charset=utf-8"
                }
            );


        const arquivo =
            new File(
                [
                    blob
                ],
                nomeArquivo,
                {
                    type:
                        "application/json"
                }
            );


        /*
         * Reaproveitamos o mesmo mecanismo de upload.
         */

        return await sp.uploadArquivo(
            arquivo,
            pasta
        );

    },


    // ========================================================
    // BAIXAR ARQUIVO
    // ========================================================

    baixarArquivo(
        conteudo,
        nome
    ) {

        const blob =
            new Blob(
                [
                    conteudo
                ],
                {
                    type:
                        "application/json;charset=utf-8"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            nome;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        setTimeout(
            () => {

                URL.revokeObjectURL(
                    url
                );

            },
            1000
        );

    },


    // ========================================================
    // ID
    // ========================================================

    gerarID() {

        return (
            "pub_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(
                    2,
                    8
                )
        );

    },


    // ========================================================
    // COPIAR JSON
    // ========================================================

    async copiarJSON() {

        if (
            !this.estado.dados
        ) {

            return false;

        }


        const texto =
            JSON.stringify(
                this.estado.dados,
                null,
                4
            );


        try {

            await navigator
                .clipboard
                .writeText(
                    texto
                );


            return true;

        }
        catch {

            return false;

        }

    },


    // ========================================================
    // VISUALIZAR
    // ========================================================

    visualizarPublicacao() {

        if (
            !this.estado.dados
        ) {

            return null;

        }


        return JSON.stringify(
            this.estado.dados,
            null,
            4
        );

    },


    // ========================================================
    // STATUS
    // ========================================================

    obterStatus() {

        return {

            carregando:
                this.estado
                    .carregando,

            publicando:
                this.estado
                    .publicando,

            versao:
                this.estado
                    .versao,

            ultimaPublicacao:
                this.estado
                    .ultimaPublicacao,

            erro:
                this.estado
                    .erro

        };

    }

};


window.PublicadorTV =
    PublicadorTV;


window.addEventListener(
    "load",
    () => {

        PublicadorTV.iniciar();

    }
);