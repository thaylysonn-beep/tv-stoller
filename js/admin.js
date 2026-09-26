// ============================================================
// PORTAL TV CORPORATIVA
// TV ADMIN
// VÍDEOS LOCAIS
// ============================================================

const TVAdmin = {

    // ========================================================
    // CONFIGURAÇÕES
    // ========================================================

    pastaVideos: "videos/",


    // ========================================================
    // BANCO
    // ========================================================

    banco: {

        videos: [],

        comunicados: [],

        powerbi: [],

        programacao: [],

        publicado: false,

        ultimaPublicacao: null,

        versao: 0

    },


    // ========================================================
    // ESTADO
    // ========================================================

    estado: {

        inicializado: false

    },


    // ========================================================
    // INICIAR
    // ========================================================

    iniciar() {

        this.carregarBanco();

        this.normalizarBanco();

        this.estado.inicializado = true;

        this.renderizar();

    },


    // ========================================================
    // NORMALIZAR BANCO
    // ========================================================

    normalizarBanco() {

        if (!Array.isArray(this.banco.videos)) {

            this.banco.videos = [];

        }


        if (!Array.isArray(this.banco.comunicados)) {

            this.banco.comunicados = [];

        }


        if (!Array.isArray(this.banco.powerbi)) {

            this.banco.powerbi = [];

        }


        if (!Array.isArray(this.banco.programacao)) {

            this.banco.programacao = [];

        }


        if (typeof this.banco.publicado !== "boolean") {

            this.banco.publicado = false;

        }


        if (typeof this.banco.versao !== "number") {

            this.banco.versao = 0;

        }


        // ----------------------------------------------------
        // CORRIGIR VÍDEOS ANTIGOS
        // ----------------------------------------------------

        this.banco.videos =
            this.banco.videos.map(video => {

                if (!video) {
                    return null;
                }

                const arquivo =
                    video.nomeArquivo ||
                    video.arquivoLocal ||
                    video.fileName ||
                    video.filename ||
                    "";

                if (
                    arquivo &&
                    !String(video.url || "").trim()
                ) {

                    video.url =
                        this.obterCaminhoVideo(
                            arquivo
                        );

                }

                if (
                    arquivo &&
                    !String(video.arquivoLocal || "").trim()
                ) {

                    video.arquivoLocal =
                        arquivo;

                }

                if (
                    arquivo &&
                    !String(video.nomeArquivo || "").trim()
                ) {

                    video.nomeArquivo =
                        arquivo;

                }

                if (video.ativo === undefined) {

                    video.ativo = true;

                }

                return video;

            })
            .filter(Boolean);

    },


    // ========================================================
    // CARREGAR BANCO
    // ========================================================

    carregarBanco() {

        try {

            const salvo =
                localStorage.getItem(
                    "portal_tv_corporativa"
                );


            if (salvo) {

                const dados =
                    JSON.parse(salvo);


                this.banco = {

                    ...this.banco,

                    ...dados

                };

            }

        }
        catch (erro) {

            console.error(
                "Erro ao carregar banco:",
                erro
            );

        }

    },


    // ========================================================
    // SALVAR BANCO
    // ========================================================

    salvarBanco() {

        try {

            localStorage.setItem(
                "portal_tv_corporativa",
                JSON.stringify(
                    this.banco
                )
            );


            return true;

        }
        catch (erro) {

            console.error(
                "Erro ao salvar banco:",
                erro
            );


            return false;

        }

    },


    // ========================================================
    // RENDERIZAR
    // ========================================================

    renderizar() {

        const app =
            document.getElementById(
                "app"
            );


        if (!app) {

            console.error(
                "Elemento #app não encontrado."
            );

            return;

        }


        app.innerHTML = `

            <div class="tv-admin">

                <header class="tv-admin-topo">

                    <div>

                        <h1>
                            📺 Portal TV Corporativa
                        </h1>

                        <span>
                            Administração
                        </span>

                    </div>


                    <div>

                        <span>
                            Versão
                            ${this.banco.versao}
                        </span>

                    </div>

                </header>


                <nav
                    class="tv-menu"
                    id="tvAdminMenu"
                >

                    <button
                        type="button"
                        data-tv-action="dashboard"
                    >
                        📊 Dashboard
                    </button>


                    <button
                        type="button"
                        data-tv-action="videos"
                    >
                        🎬 Vídeos
                    </button>


                    <button
                        type="button"
                        data-tv-action="comunicados"
                    >
                        📢 Comunicados
                    </button>


                    <button
                        type="button"
                        data-tv-action="powerbi"
                    >
                        📈 Power BI
                    </button>


                    <button
                        type="button"
                        data-tv-action="programacao"
                    >
                        🗓️ Programação
                    </button>


                    <button
                        type="button"
                        class="btn-publicar"
                        data-tv-action="publicar"
                    >
                        🚀 Publicar
                    </button>

                </nav>


                <main
                    id="tv-admin-conteudo"
                    class="tv-admin-conteudo"
                ></main>

            </div>

        `;


        this.configurarEventos();

        this.dashboard();

    },


    // ========================================================
    // EVENTOS MENU
    // ========================================================

    configurarEventos() {

        const menu =
            document.getElementById(
                "tvAdminMenu"
            );


        if (!menu) {

            return;

        }


        menu.onclick =
            evento => {

                const botao =
                    evento.target.closest(
                        "[data-tv-action]"
                    );


                if (!botao) {

                    return;

                }


                const acao =
                    botao.dataset.tvAction;


                if (
                    acao ===
                    "dashboard"
                ) {

                    this.dashboard();

                }
                else if (
                    acao ===
                    "videos"
                ) {

                    this.telaVideos();

                }
                else if (
                    acao ===
                    "comunicados"
                ) {

                    this.telaComunicados();

                }
                else if (
                    acao ===
                    "powerbi"
                ) {

                    this.telaPowerBI();

                }
                else if (
                    acao ===
                    "programacao"
                ) {

                    this.telaProgramacao();

                }
                else if (
                    acao ===
                    "publicar"
                ) {

                    this.publicar();

                }

            };

    },


    // ========================================================
    // DASHBOARD
    // ========================================================

    dashboard() {

        const conteudo =
            document.getElementById(
                "tv-admin-conteudo"
            );


        if (!conteudo) {

            return;

        }


        conteudo.innerHTML = `

            <section>

                <div class="tv-admin-titulo">

                    <div>

                        <h2>
                            Dashboard
                        </h2>

                        <p>
                            Visão geral do Portal TV Corporativa.
                        </p>

                    </div>

                </div>


                <div
                    class="tv-cards"
                    style="
                        display:grid;
                        grid-template-columns:
                            repeat(
                                auto-fit,
                                minmax(220px,1fr)
                            );
                        gap:16px;
                    "
                >

                    ${this.cardDashboard(
                        "🎬",
                        "Vídeos",
                        this.banco.videos.length
                    )}


                    ${this.cardDashboard(
                        "📢",
                        "Comunicados",
                        this.banco.comunicados.length
                    )}


                    ${this.cardDashboard(
                        "📈",
                        "Power BI",
                        this.banco.powerbi.length
                    )}


                    ${this.cardDashboard(
                        "🗓️",
                        "Programações",
                        this.banco.programacao.length
                    )}

                </div>


                <div
                    style="
                        margin-top:24px;
                        padding:20px;
                        border-radius:16px;
                        background:#fff;
                        border:1px solid #e5e7eb;
                    "
                >

                    <h3>
                        Status
                    </h3>


                    <p>

                        ${
                            this.banco.publicado
                                ? "🟢 Publicado"
                                : "🟡 Existem alterações não publicadas"
                        }

                    </p>


                    <p>

                        Versão:

                        <strong>
                            ${this.banco.versao}
                        </strong>

                    </p>


                    <p>

                        Última publicação:

                        <strong>

                            ${
                                this.banco.ultimaPublicacao
                                    ? new Date(
                                        this.banco.ultimaPublicacao
                                      ).toLocaleString(
                                        "pt-BR"
                                      )
                                    : "Nunca"
                            }

                        </strong>

                    </p>


                    <p
                        style="
                            margin-bottom:0;
                            color:#6b7280;
                            font-size:13px;
                        "
                    >

                        📁 Vídeos locais:
                        <strong>
                            ${this.pastaVideos}
                        </strong>

                    </p>

                </div>

            </section>

        `;

    },


    // ========================================================
    // CARD DASHBOARD
    // ========================================================

    cardDashboard(
        icone,
        titulo,
        valor
    ) {

        return `

            <div
                style="
                    background:#fff;
                    border:1px solid #e5e7eb;
                    border-radius:16px;
                    padding:22px;
                "
            >

                <div
                    style="
                        font-size:30px;
                    "
                >
                    ${icone}
                </div>


                <div
                    style="
                        font-size:30px;
                        font-weight:700;
                        margin-top:8px;
                    "
                >
                    ${valor}
                </div>


                <div>
                    ${titulo}
                </div>

            </div>

        `;

    },


    // ========================================================
    // TELA VÍDEOS
    // ========================================================

    telaVideos() {

        const conteudo =
            document.getElementById(
                "tv-admin-conteudo"
            );


        if (!conteudo) {

            return;

        }


        conteudo.innerHTML = `

            <section>

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        gap:15px;
                        margin-bottom:20px;
                    "
                >

                    <div>

                        <h2>
                            🎬 Vídeos
                        </h2>


                        <p>
                            Gerencie os vídeos exibidos na TV.
                        </p>


                        <div
                            style="
                                margin-top:8px;
                                padding:10px 12px;
                                background:#f8fafc;
                                border:1px solid #e5e7eb;
                                border-radius:10px;
                                font-size:13px;
                                color:#475569;
                            "
                        >

                            📁 Os arquivos devem estar em:
                            <strong>
                                ${this.pastaVideos}
                            </strong>

                        </div>

                    </div>


                    <button
                        type="button"
                        class="btn-primary"
                        id="btnNovoVideo"
                    >
                        ➕ Novo vídeo
                    </button>

                </div>


                <div
                    id="listaVideos"
                    style="
                        display:grid;
                        gap:12px;
                    "
                >

                    ${
                        this.banco.videos.length

                            ? this.banco.videos
                                .map(
                                    video =>
                                        this.cardVideo(
                                            video
                                        )
                                )
                                .join("")

                            : `

                                <div
                                    style="
                                        padding:30px;
                                        text-align:center;
                                        background:#fff;
                                        border:1px solid #e5e7eb;
                                        border-radius:16px;
                                    "
                                >

                                    Nenhum vídeo cadastrado.

                                </div>

                            `
                    }

                </div>

            </section>

        `;


        this.configurarEventosVideos();

    },


    // ========================================================
    // EVENTOS VÍDEOS
    // ========================================================

    configurarEventosVideos() {

        const botao =
            document.getElementById(
                "btnNovoVideo"
            );


        if (botao) {

            botao.onclick =
                () =>
                    this.novoVideo();

        }

    },


    // ========================================================
    // CARD VÍDEO
    // ========================================================

    cardVideo(
        video
    ) {

        const caminho =
            video.url ||
            this.obterCaminhoVideo(
                video.nomeArquivo ||
                video.arquivoLocal ||
                ""
            );


        return `

            <div
                style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:15px;
                    padding:18px;
                    background:#fff;
                    border:1px solid #e5e7eb;
                    border-radius:14px;
                "
            >

                <div
                    style="
                        min-width:0;
                        flex:1;
                    "
                >

                    <strong>

                        🎬

                        ${this.escapeHTML(
                            video.nome ||
                            video.titulo ||
                            "Vídeo"
                        )}

                    </strong>


                    <div
                        style="
                            font-size:13px;
                            color:#6b7280;
                            margin-top:5px;
                            word-break:break-all;
                        "
                    >

                        📁

                        ${this.escapeHTML(
                            caminho
                        )}

                    </div>


                    ${
                        video.tamanho

                            ? `
                                <div
                                    style="
                                        font-size:12px;
                                        color:#94a3b8;
                                        margin-top:4px;
                                    "
                                >
                                    ${this.formatarTamanho(
                                        video.tamanho
                                    )}
                                </div>
                              `

                            : ""
                    }

                </div>


                <div
                    style="
                        display:flex;
                        gap:6px;
                        flex-wrap:wrap;
                    "
                >

                    <button
                        type="button"
                        onclick="
                            TVAdmin.alternarVideo(
                                '${this.escapeJS(
                                    video.id
                                )}'
                            )
                        "
                    >

                        ${
                            video.ativo
                                ? "🟢 Ativo"
                                : "⚪ Inativo"
                        }

                    </button>


                    <button
                        type="button"
                        onclick="
                            TVAdmin.testarVideo(
                                '${this.escapeJS(
                                    video.id
                                )}'
                            )
                        "
                    >
                        ▶️ Testar
                    </button>


                    <button
                        type="button"
                        onclick="
                            TVAdmin.editarVideo(
                                '${this.escapeJS(
                                    video.id
                                )}'
                            )
                        "
                    >
                        ✏️
                    </button>


                    <button
                        type="button"
                        onclick="
                            TVAdmin.excluirVideo(
                                '${this.escapeJS(
                                    video.id
                                )}'
                            )
                        "
                    >
                        🗑️
                    </button>

                </div>

            </div>

        `;

    },


    // ========================================================
    // NOVO VÍDEO
    // ========================================================

    novoVideo() {

        const existente =
            document.getElementById(
                "modalNovoVideo"
            );


        if (existente) {

            return;

        }


        const modal =
            document.createElement(
                "div"
            );


        modal.id =
            "modalNovoVideo";


        modal.style.cssText = `
            position:fixed;
            inset:0;
            z-index:99999;
            background:rgba(0,0,0,.58);
            display:flex;
            align-items:center;
            justify-content:center;
            padding:20px;
        `;


        modal.innerHTML = `

            <div
                style="
                    width:min(620px,92vw);
                    background:#fff;
                    border-radius:18px;
                    padding:24px;
                    box-shadow:0 20px 60px rgba(0,0,0,.25);
                "
            >

                <h2
                    style="
                        margin-top:0;
                    "
                >
                    🎬 Novo vídeo
                </h2>


                <label
                    style="
                        display:block;
                        font-weight:600;
                        margin-bottom:6px;
                    "
                >
                    Nome do vídeo
                </label>


                <input
                    id="novoVideoNome"
                    type="text"
                    placeholder="Ex.: Segurança - Semana 1"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:12px;
                        margin-bottom:18px;
                        border:1px solid #d1d5db;
                        border-radius:10px;
                    "
                />


                <label
                    style="
                        display:block;
                        font-weight:600;
                        margin-bottom:6px;
                    "
                >
                    Nome do arquivo
                </label>


                <input
                    id="novoVideoArquivo"
                    type="text"
                    placeholder="Ex.: seguranca-semana-1.mp4"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:12px;
                        border:1px solid #d1d5db;
                        border-radius:10px;
                        margin-bottom:8px;
                    "
                />


                <div
                    style="
                        padding:13px;
                        border-radius:10px;
                        background:#f8fafc;
                        border:1px solid #e5e7eb;
                        font-size:13px;
                        color:#64748b;
                        margin-bottom:15px;
                    "
                >

                    📁 O arquivo precisa existir dentro da pasta:

                    <br>

                    <strong>
                        ${this.pastaVideos}
                    </strong>

                    <br><br>

                    Exemplo:

                    <br>

                    <strong>
                        ${this.pastaVideos}seguranca-semana-1.mp4
                    </strong>

                </div>


                <div
                    id="novoVideoPreview"
                    style="
                        display:none;
                        margin-bottom:15px;
                    "
                >

                    <video
                        id="novoVideoPreviewPlayer"
                        controls
                        style="
                            width:100%;
                            max-height:240px;
                            background:#000;
                            border-radius:10px;
                        "
                    ></video>

                </div>


                <div
                    id="novoVideoStatus"
                    style="
                        min-height:24px;
                        margin-bottom:15px;
                        font-size:14px;
                    "
                ></div>


                <div
                    style="
                        display:flex;
                        justify-content:flex-end;
                        gap:10px;
                    "
                >

                    <button
                        type="button"
                        id="btnCancelarNovoVideo"
                    >
                        Cancelar
                    </button>


                    <button
                        type="button"
                        id="btnSalvarNovoVideo"
                        class="btn-primary"
                    >
                        💾 Adicionar vídeo
                    </button>

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        const arquivo =
            document.getElementById(
                "novoVideoArquivo"
            );


        const preview =
            document.getElementById(
                "novoVideoPreview"
            );


        const previewPlayer =
            document.getElementById(
                "novoVideoPreviewPlayer"
            );


        arquivo.oninput =
            () => {

                const nomeArquivo =
                    arquivo.value.trim();


                if (!nomeArquivo) {

                    preview.style.display =
                        "none";

                    previewPlayer.removeAttribute(
                        "src"
                    );

                    return;

                }


                const caminho =
                    this.obterCaminhoVideo(
                        nomeArquivo
                    );


                previewPlayer.src =
                    caminho;


                preview.style.display =
                    "block";

            };


        document.getElementById(
            "btnCancelarNovoVideo"
        ).onclick =
            () =>
                this.fecharModalVideo();


        document.getElementById(
            "btnSalvarNovoVideo"
        ).onclick =
            () =>
                this.salvarNovoVideo();

    },


    // ========================================================
    // FECHAR MODAL
    // ========================================================

    fecharModalVideo() {

        const modal =
            document.getElementById(
                "modalNovoVideo"
            );


        if (modal) {

            modal.remove();

        }

    },


    // ========================================================
    // SALVAR NOVO VÍDEO
    // ========================================================

    salvarNovoVideo() {

        const nome =
            document.getElementById(
                "novoVideoNome"
            )?.value.trim();


        const arquivo =
            document.getElementById(
                "novoVideoArquivo"
            )?.value.trim();


        const status =
            document.getElementById(
                "novoVideoStatus"
            );


        if (!nome) {

            alert(
                "Informe o nome do vídeo."
            );

            return;

        }


        if (!arquivo) {

            alert(
                "Informe o nome do arquivo."
            );

            return;

        }


        // ----------------------------------------------------
        // LIMPAR CAMINHO DIGITADO
        // ----------------------------------------------------

        let nomeArquivo =
            arquivo
                .replace(/\\/g, "/")
                .split("/")
                .pop()
                .trim();


        if (!nomeArquivo) {

            alert(
                "Informe um nome de arquivo válido."
            );

            return;

        }


        // ----------------------------------------------------
        // VERIFICAR EXTENSÃO
        // ----------------------------------------------------

        const extensoesAceitas = [

            ".mp4",
            ".webm",
            ".ogg",
            ".ogv",
            ".mov",
            ".m4v"

        ];


        const extensaoValida =
            extensoesAceitas.some(
                extensao =>
                    nomeArquivo
                        .toLowerCase()
                        .endsWith(
                            extensao
                        )
            );


        if (!extensaoValida) {

            alert(
                "Informe um arquivo de vídeo válido.\n\n" +
                "Exemplo: meu-video.mp4"
            );

            return;

        }


        // ----------------------------------------------------
        // CAMINHO LOCAL
        // ----------------------------------------------------

        const caminho =
            this.obterCaminhoVideo(
                nomeArquivo
            );


        // ----------------------------------------------------
        // VERIFICAR DUPLICIDADE
        // ----------------------------------------------------

        const existe =
            this.banco.videos.some(
                video =>
                    String(
                        video.nomeArquivo ||
                        video.arquivoLocal ||
                        ""
                    ).toLowerCase() ===
                    nomeArquivo.toLowerCase()
            );


        if (existe) {

            alert(
                "Esse arquivo já está cadastrado."
            );

            return;

        }


        // ----------------------------------------------------
        // OBJETO
        // ----------------------------------------------------

        const video = {

            id:
                this.gerarID(),

            tipo:
                "video",

            nome:
                nome,

            titulo:
                nome,

            nomeArquivo:
                nomeArquivo,

            arquivoLocal:
                nomeArquivo,

            arquivo:
                caminho,

            url:
                caminho,

            arquivoUrl:
                caminho,

            fileUrl:
                caminho,

            tamanho:
                0,

            tipoArquivo:
                "video",

            ativo:
                true,

            publicado:
                false,

            criadoEm:
                new Date().toISOString()

        };


        // ----------------------------------------------------
        // ADICIONAR
        // ----------------------------------------------------

        this.banco.videos.push(
            video
        );


        this.banco.publicado =
            false;


        this.salvarBanco();


        if (status) {

            status.innerHTML = `

                <span
                    style="
                        color:#15803d;
                    "
                >
                    ✓ Vídeo cadastrado.
                </span>

            `;

        }


        this.fecharModalVideo();

        this.telaVideos();


        alert(
            "✅ Vídeo cadastrado com sucesso!\n\n" +
            "Arquivo esperado:\n" +
            caminho
        );

    },


    // ========================================================
    // OBTER CAMINHO DO VÍDEO
    // ========================================================

    obterCaminhoVideo(
        nomeArquivo
    ) {

        if (!nomeArquivo) {

            return "";

        }


        let caminho =
            String(
                nomeArquivo
            )
            .trim()
            .replace(
                /\\/g,
                "/"
            );


        // ----------------------------------------------------
        // URL COMPLETA
        // ----------------------------------------------------

        if (
            /^https?:\/\//i.test(
                caminho
            )
        ) {

            return caminho;

        }


        // ----------------------------------------------------
        // CAMINHO ABSOLUTO
        // ----------------------------------------------------

        if (
            caminho.startsWith("/")
        ) {

            return caminho;

        }


        // ----------------------------------------------------
        // REMOVER ./ 
        // ----------------------------------------------------

        caminho =
            caminho.replace(
                /^\.\/+/,
                ""
            );


        // ----------------------------------------------------
        // SE JÁ COMEÇA COM VIDEOS/
        // ----------------------------------------------------

        if (
            /^videos\//i.test(
                caminho
            )
        ) {

            return caminho;

        }


        // ----------------------------------------------------
        // PEGAR APENAS O NOME
        // ----------------------------------------------------

        caminho =
            caminho
                .split("/")
                .pop();


        // ----------------------------------------------------
        // ENCODIFICAR
        // ----------------------------------------------------

        return (
            this.pastaVideos +
            encodeURIComponent(
                caminho
            )
        );

    },


    // ========================================================
    // TESTAR VÍDEO
    // ========================================================

    testarVideo(
        id
    ) {

        const video =
            this.banco.videos.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        id
                    )
            );


        if (!video) {

            alert(
                "Vídeo não encontrado."
            );

            return;

        }


        const caminho =
            video.url ||
            this.obterCaminhoVideo(
                video.nomeArquivo ||
                video.arquivoLocal
            );


        const modal =
            document.createElement(
                "div"
            );


        modal.style.cssText = `
            position:fixed;
            inset:0;
            z-index:99999;
            background:rgba(0,0,0,.78);
            display:flex;
            align-items:center;
            justify-content:center;
            padding:20px;
        `;


        modal.innerHTML = `

            <div
                style="
                    width:min(1000px,95vw);
                    background:#111827;
                    border-radius:18px;
                    padding:18px;
                "
            >

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        color:#fff;
                        margin-bottom:12px;
                    "
                >

                    <strong>
                        🎬
                        ${this.escapeHTML(
                            video.nome ||
                            video.titulo
                        )}
                    </strong>


                    <button
                        type="button"
                        id="fecharTesteVideo"
                    >
                        ✕ Fechar
                    </button>

                </div>


                <video
                    controls
                    autoplay
                    style="
                        width:100%;
                        max-height:70vh;
                        background:#000;
                        border-radius:10px;
                    "
                    src="${this.escapeHTML(
                        caminho
                    )}"
                ></video>


                <div
                    style="
                        color:#cbd5e1;
                        font-size:12px;
                        margin-top:10px;
                        word-break:break-all;
                    "
                >
                    ${this.escapeHTML(
                        caminho
                    )}
                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        document.getElementById(
            "fecharTesteVideo"
        ).onclick =
            () =>
                modal.remove();

    },


    // ========================================================
    // EDITAR VÍDEO
    // ========================================================

    editarVideo(
        id
    ) {

        const video =
            this.banco.videos.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        id
                    )
            );


        if (!video) {

            return;

        }


        const novoNome =
            prompt(
                "Novo nome do vídeo:",
                video.nome ||
                video.titulo ||
                ""
            );


        if (
            novoNome ===
            null
        ) {

            return;

        }


        if (
            !novoNome.trim()
        ) {

            return;

        }


        video.nome =
            novoNome.trim();


        video.titulo =
            novoNome.trim();


        this.banco.publicado =
            false;


        this.salvarBanco();

        this.telaVideos();

    },


    // ========================================================
    // ALTERNAR VÍDEO
    // ========================================================

    alternarVideo(
        id
    ) {

        const video =
            this.banco.videos.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        id
                    )
            );


        if (!video) {

            return;

        }


        video.ativo =
            !video.ativo;


        this.banco.publicado =
            false;


        this.salvarBanco();

        this.telaVideos();

    },


    // ========================================================
    // EXCLUIR VÍDEO
    // ========================================================

    excluirVideo(
        id
    ) {

        const video =
            this.banco.videos.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        id
                    )
            );


        if (!video) {

            return;

        }


        if (
            !confirm(
                "Deseja realmente remover este vídeo do Portal TV?\n\n" +
                "O arquivo físico dentro da pasta videos/ NÃO será apagado."
            )
        ) {

            return;

        }


        this.banco.videos =
            this.banco.videos.filter(
                item =>
                    String(
                        item.id
                    ) !==
                    String(
                        id
                    )
            );


        this.banco.programacao =
            this.banco.programacao.filter(
                item =>
                    String(
                        item.itemId ||
                        item.videoId
                    ) !==
                    String(
                        id
                    )
            );


        this.banco.publicado =
            false;


        this.salvarBanco();

        this.telaVideos();

    },


    // ========================================================
    // COMUNICADOS
    // ========================================================

    telaComunicados() {

        const conteudo =
            document.getElementById(
                "tv-admin-conteudo"
            );


        if (!conteudo) {

            return;

        }


        conteudo.innerHTML = `

            <section>

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        margin-bottom:20px;
                    "
                >

                    <div>

                        <h2>
                            📢 Comunicados
                        </h2>

                        <p>
                            Gerencie os comunicados da TV.
                        </p>

                    </div>


                    <button
                        type="button"
                        class="btn-primary"
                        id="btnNovoComunicado"
                    >
                        ➕ Novo comunicado
                    </button>

                </div>


                <div
                    style="
                        display:grid;
                        gap:12px;
                    "
                >

                    ${
                        this.banco.comunicados.length

                            ? this.banco.comunicados
                                .map(
                                    item =>
                                        this.cardComunicado(
                                            item
                                        )
                                )
                                .join("")

                            : `

                                <div
                                    style="
                                        padding:30px;
                                        text-align:center;
                                        background:#fff;
                                        border:1px solid #e5e7eb;
                                        border-radius:16px;
                                    "
                                >

                                    Nenhum comunicado cadastrado.

                                </div>

                            `
                    }

                </div>

            </section>

        `;


        document.getElementById(
            "btnNovoComunicado"
        ).onclick =
            () =>
                this.novoComunicado();

    },


    // ========================================================
    // CARD COMUNICADO
    // ========================================================

    cardComunicado(
        item
    ) {

        return `

            <div
                style="
                    padding:18px;
                    background:#fff;
                    border:1px solid #e5e7eb;
                    border-radius:14px;
                    display:flex;
                    justify-content:space-between;
                    gap:15px;
                "
            >

                <div>

                    <strong>

                        📢

                        ${this.escapeHTML(
                            item.titulo ||
                            item.nome ||
                            "Comunicado"
                        )}

                    </strong>


                    <div
                        style="
                            color:#6b7280;
                            font-size:13px;
                            margin-top:5px;
                        "
                    >

                        ${
                            item.duracao ||
                            10
                        }

                        segundos

                    </div>

                </div>


                <button
                    type="button"
                    onclick="
                        TVAdmin.excluirComunicado(
                            '${this.escapeJS(
                                item.id
                            )}'
                        )
                    "
                >
                    🗑️
                </button>

            </div>

        `;

    },


    // ========================================================
    // NOVO COMUNICADO
    // ========================================================

    novoComunicado() {

        const titulo =
            prompt(
                "Título do comunicado:"
            );


        if (!titulo) {

            return;

        }


        const url =
            prompt(
                "URL ou imagem do comunicado:"
            );


        if (!url) {

            return;

        }


        const duracao =
            Number(
                prompt(
                    "Duração em segundos:",
                    "10"
                )
            ) ||
            10;


        this.banco.comunicados.push({

            id:
                this.gerarID(),

            tipo:
                "comunicado",

            titulo:
                titulo.trim(),

            nome:
                titulo.trim(),

            url:
                url.trim(),

            duracao:
                duracao,

            ativo:
                true,

            criadoEm:
                new Date().toISOString()

        });


        this.banco.publicado =
            false;


        this.salvarBanco();

        this.telaComunicados();

    },


    // ========================================================
    // EXCLUIR COMUNICADO
    // ========================================================

    excluirComunicado(
        id
    ) {

        if (
            !confirm(
                "Deseja remover este comunicado?"
            )
        ) {

            return;

        }


        this.banco.comunicados =
            this.banco.comunicados.filter(
                item =>
                    String(
                        item.id
                    ) !==
                    String(
                        id
                    )
            );


        this.banco.publicado =
            false;


        this.salvarBanco();

        this.telaComunicados();

    },


    // ========================================================
    // POWER BI
    // ========================================================

    telaPowerBI() {

        const conteudo =
            document.getElementById(
                "tv-admin-conteudo"
            );


        if (!conteudo) {

            return;

        }


        conteudo.innerHTML = `

            <section>

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        margin-bottom:20px;
                    "
                >

                    <div>

                        <h2>
                            📈 Power BI
                        </h2>

                        <p>
                            Gerencie os painéis Power BI da TV.
                        </p>

                    </div>


                    <button
                        type="button"
                        class="btn-primary"
                        id="btnNovoPowerBI"
                    >
                        ➕ Novo Power BI
                    </button>

                </div>


                <div
                    style="
                        display:grid;
                        gap:12px;
                    "
                >

                    ${
                        this.banco.powerbi.length

                            ? this.banco.powerbi
                                .map(
                                    item =>
                                        this.cardPowerBI(
                                            item
                                        )
                                )
                                .join("")

                            : `

                                <div
                                    style="
                                        padding:30px;
                                        text-align:center;
                                        background:#fff;
                                        border:1px solid #e5e7eb;
                                        border-radius:16px;
                                    "
                                >

                                    Nenhum painel cadastrado.

                                </div>

                            `
                    }

                </div>

            </section>

        `;


        document.getElementById(
            "btnNovoPowerBI"
        ).onclick =
            () =>
                this.novoPowerBI();

    },


    // ========================================================
    // CARD POWER BI
    // ========================================================

    cardPowerBI(
        item
    ) {

        return `

            <div
                style="
                    padding:18px;
                    background:#fff;
                    border:1px solid #e5e7eb;
                    border-radius:14px;
                    display:flex;
                    justify-content:space-between;
                    gap:15px;
                "
            >

                <div>

                    <strong>

                        📈

                        ${this.escapeHTML(
                            item.nome ||
                            "Power BI"
                        )}

                    </strong>


                    <div
                        style="
                            color:#6b7280;
                            font-size:13px;
                            margin-top:5px;
                        "
                    >

                        ${
                            item.duracao ||
                            20
                        }

                        segundos

                    </div>

                </div>


                <button
                    type="button"
                    onclick="
                        TVAdmin.excluirPowerBI(
                            '${this.escapeJS(
                                item.id
                            )}'
                        )
                    "
                >
                    🗑️
                </button>

            </div>

        `;

    },


    // ========================================================
    // NOVO POWER BI
    // ========================================================

    novoPowerBI() {

        const nome =
            prompt(
                "Nome do painel:"
            );


        if (!nome) {

            return;

        }


        const url =
            prompt(
                "URL do Power BI:"
            );


        if (!url) {

            return;

        }


        const duracao =
            Number(
                prompt(
                    "Duração em segundos:",
                    "20"
                )
            ) ||
            20;


        this.banco.powerbi.push({

            id:
                this.gerarID(),

            tipo:
                "powerbi",

            nome:
                nome.trim(),

            url:
                url.trim(),

            duracao:
                duracao,

            ativo:
                true,

            criadoEm:
                new Date().toISOString()

        });


        this.banco.publicado =
            false;


        this.salvarBanco();

        this.telaPowerBI();

    },


    // ========================================================
    // EXCLUIR POWER BI
    // ========================================================

    excluirPowerBI(
        id
    ) {

        if (
            !confirm(
                "Deseja remover este painel?"
            )
        ) {

            return;

        }


        this.banco.powerbi =
            this.banco.powerbi.filter(
                item =>
                    String(
                        item.id
                    ) !==
                    String(
                        id
                    )
            );


        this.banco.publicado =
            false;


        this.salvarBanco();

        this.telaPowerBI();

    },


    // ========================================================
    // PROGRAMAÇÃO
    // ========================================================

    telaProgramacao() {

        const conteudo =
            document.getElementById(
                "tv-admin-conteudo"
            );


        if (!conteudo) {

            return;

        }


        conteudo.innerHTML = `

            <section>

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        margin-bottom:20px;
                    "
                >

                    <div>

                        <h2>
                            🗓️ Programação
                        </h2>

                        <p>
                            Defina a ordem dos conteúdos da TV.
                        </p>

                    </div>


                    <button
                        type="button"
                        class="btn-primary"
                        id="btnAdicionarProgramacao"
                    >
                        ➕ Adicionar
                    </button>

                </div>


                <div
                    style="
                        display:grid;
                        gap:10px;
                    "
                >

                    ${
                        this.banco.programacao.length

                            ? this.banco.programacao
                                .map(
                                    (item, indice) =>
                                        this.cardProgramacao(
                                            item,
                                            indice
                                        )
                                )
                                .join("")

                            : `

                                <div
                                    style="
                                        padding:30px;
                                        text-align:center;
                                        background:#fff;
                                        border:1px solid #e5e7eb;
                                        border-radius:16px;
                                    "
                                >

                                    Nenhum item na programação.

                                </div>

                            `
                    }

                </div>

            </section>

        `;


        document.getElementById(
            "btnAdicionarProgramacao"
        ).onclick =
            () =>
                this.adicionarProgramacao();

    },


    // ========================================================
    // CARD PROGRAMAÇÃO
    // ========================================================

    cardProgramacao(
        item,
        indice
    ) {

        const numero =
            typeof indice ===
            "number"

                ? indice + 1

                : this.banco.programacao.indexOf(
                    item
                  ) + 1;


        return `

            <div
                style="
                    padding:16px;
                    background:#fff;
                    border:1px solid #e5e7eb;
                    border-radius:14px;
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:15px;
                "
            >

                <div>

                    <strong>

                        ${numero}.

                        ${this.escapeHTML(
                            item.titulo ||
                            item.nome ||
                            "Item"
                        )}

                    </strong>


                    <div
                        style="
                            color:#6b7280;
                            font-size:13px;
                            margin-top:4px;
                        "
                    >

                        ${
                            item.tipo ||
                            "conteúdo"
                        }


                        ${
                            item.tipo === "video"
                                ? " • " +
                                  this.escapeHTML(
                                      item.url ||
                                      ""
                                  )
                                : ""
                        }

                    </div>

                </div>


                <div
                    style="
                        display:flex;
                        gap:5px;
                    "
                >

                    <button
                        type="button"
                        onclick="
                            TVAdmin.moverProgramacao(
                                '${this.escapeJS(
                                    item.id
                                )}',
                                'cima'
                            )
                        "
                    >
                        ⬆️
                    </button>


                    <button
                        type="button"
                        onclick="
                            TVAdmin.moverProgramacao(
                                '${this.escapeJS(
                                    item.id
                                )}',
                                'baixo'
                            )
                        "
                    >
                        ⬇️
                    </button>


                    <button
                        type="button"
                        onclick="
                            TVAdmin.excluirProgramacao(
                                '${this.escapeJS(
                                    item.id
                                )}'
                            )
                        "
                    >
                        🗑️
                    </button>

                </div>

            </div>

        `;

    },


    // ========================================================
    // ADICIONAR PROGRAMAÇÃO
    // ========================================================

    adicionarProgramacao() {

        const opcoes = [];


        this.banco.videos
            .filter(
                item =>
                    item.ativo !== false
            )
            .forEach(
                item => {

                    opcoes.push({

                        id:
                            item.id,

                        tipo:
                            "video",

                        nome:
                            item.nome ||
                            item.titulo ||
                            "Vídeo"

                    });

                }
            );


        this.banco.comunicados
            .filter(
                item =>
                    item.ativo !== false
            )
            .forEach(
                item => {

                    opcoes.push({

                        id:
                            item.id,

                        tipo:
                            "comunicado",

                        nome:
                            item.titulo ||
                            item.nome ||
                            "Comunicado"

                    });

                }
            );


        this.banco.powerbi
            .filter(
                item =>
                    item.ativo !== false
            )
            .forEach(
                item => {

                    opcoes.push({

                        id:
                            item.id,

                        tipo:
                            "powerbi",

                        nome:
                            item.nome ||
                            "Power BI"

                    });

                }
            );


        if (!opcoes.length) {

            alert(
                "Cadastre primeiro um vídeo, comunicado ou Power BI."
            );

            return;

        }


        const texto =
            opcoes
                .map(
                    (item, indice) =>
                        `${indice + 1} - ${item.tipo.toUpperCase()} - ${item.nome}`
                )
                .join("\n");


        const escolha =
            Number(
                prompt(
                    "Escolha o conteúdo:\n\n" +
                    texto
                )
            );


        if (
            !escolha ||
            !opcoes[
                escolha - 1
            ]
        ) {

            return;

        }


        const selecionado =
            opcoes[
                escolha - 1
            ];


        const conteudoOriginal =
            this.obterConteudoPorID(
                selecionado.id,
                selecionado.tipo
            );


        const programacao = {

            id:
                this.gerarID(),

            itemId:
                selecionado.id,

            tipo:
                selecionado.tipo,

            nome:
                selecionado.nome,

            titulo:
                selecionado.nome,

            url:
                conteudoOriginal?.url ||
                "",

            duracao:
                conteudoOriginal?.duracao ||
                0,

            criadoEm:
                new Date().toISOString()

        };


        this.banco.programacao.push(
            programacao
        );


        this.banco.publicado =
            false;


        this.salvarBanco();

        this.telaProgramacao();

    },


    // ========================================================
    // OBTER CONTEÚDO POR ID
    // ========================================================

    obterConteudoPorID(
        id,
        tipo
    ) {

        if (
            tipo ===
            "video"
        ) {

            return this.banco.videos.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        id
                    )
            );

        }


        if (
            tipo ===
            "comunicado"
        ) {

            return this.banco.comunicados.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        id
                    )
            );

        }


        if (
            tipo ===
            "powerbi"
        ) {

            return this.banco.powerbi.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        id
                    )
            );

        }


        return null;

    },


    // ========================================================
    // MOVER PROGRAMAÇÃO
    // ========================================================

    moverProgramacao(
        id,
        direcao
    ) {

        const indice =
            this.banco.programacao.findIndex(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        id
                    )
            );


        if (
            indice < 0
        ) {

            return;

        }


        const novoIndice =
            direcao ===
            "cima"

                ? indice - 1

                : indice + 1;


        if (
            novoIndice < 0 ||
            novoIndice >=
            this.banco.programacao.length
        ) {

            return;

        }


        const atual =
            this.banco.programacao[
                indice
            ];


        const outro =
            this.banco.programacao[
                novoIndice
            ];


        this.banco.programacao[
            indice
        ] =
            outro;


        this.banco.programacao[
            novoIndice
        ] =
            atual;


        this.banco.publicado =
            false;


        this.salvarBanco();

        this.telaProgramacao();

    },


    // ========================================================
    // EXCLUIR PROGRAMAÇÃO
    // ========================================================

    excluirProgramacao(
        id
    ) {

        if (
            !confirm(
                "Remover este item da programação?"
            )
        ) {

            return;

        }


        this.banco.programacao =
            this.banco.programacao.filter(
                item =>
                    String(
                        item.id
                    ) !==
                    String(
                        id
                    )
            );


        this.banco.publicado =
            false;


        this.salvarBanco();

        this.telaProgramacao();

    },


    // ========================================================
    // PUBLICAR
    // ========================================================

    publicar() {

        if (
            !this.banco.programacao.length
        ) {

            alert(
                "A programação está vazia."
            );

            return;

        }


        // ----------------------------------------------------
        // GARANTIR CAMINHOS DOS VÍDEOS
        // ----------------------------------------------------

        this.banco.videos =
            this.banco.videos.map(
                video => {

                    const arquivo =
                        video.nomeArquivo ||
                        video.arquivoLocal ||
                        "";


                    if (
                        arquivo
                    ) {

                        const caminho =
                            this.obterCaminhoVideo(
                                arquivo
                            );


                        video.url =
                            caminho;


                        video.arquivo =
                            caminho;


                        video.arquivoUrl =
                            caminho;


                        video.fileUrl =
                            caminho;

                    }


                    return video;

                }
            );


        // ----------------------------------------------------
        // ATUALIZAR REFERÊNCIAS DA PROGRAMAÇÃO
        // ----------------------------------------------------

        this.banco.programacao =
            this.banco.programacao.map(
                item => {

                    const conteudo =
                        this.obterConteudoPorID(
                            item.itemId,
                            item.tipo
                        );


                    if (
                        conteudo
                    ) {

                        item.nome =
                            conteudo.nome ||
                            conteudo.titulo ||
                            item.nome;


                        item.titulo =
                            item.nome;


                        if (
                            item.tipo ===
                            "video"
                        ) {

                            item.url =
                                conteudo.url ||
                                this.obterCaminhoVideo(
                                    conteudo.nomeArquivo ||
                                    conteudo.arquivoLocal
                                );

                        }
                        else {

                            item.url =
                                conteudo.url ||
                                "";

                        }


                        item.duracao =
                            conteudo.duracao ||
                            item.duracao ||
                            0;

                    }


                    return item;

                }
            );


        this.banco.publicado =
            true;


        this.banco.ultimaPublicacao =
            new Date().toISOString();


        this.banco.versao =
            Number(
                this.banco.versao
            ) + 1;


        this.salvarBanco();


        alert(
            "🚀 Programação publicada localmente com sucesso!"
        );


        this.renderizar();

    },


    // ========================================================
    // FORMATAR TAMANHO
    // ========================================================

    formatarTamanho(
        bytes
    ) {

        const tamanho =
            Number(
                bytes
            ) ||
            0;


        if (
            tamanho <
            1024
        ) {

            return (
                tamanho +
                " B"
            );

        }


        if (
            tamanho <
            1024 *
            1024
        ) {

            return (
                (
                    tamanho /
                    1024
                ).toFixed(
                    1
                ) +
                " KB"
            );

        }


        if (
            tamanho <
            1024 *
            1024 *
            1024
        ) {

            return (
                (
                    tamanho /
                    (
                        1024 *
                        1024
                    )
                ).toFixed(
                    1
                ) +
                " MB"
            );

        }


        return (
            (
                tamanho /
                (
                    1024 *
                    1024 *
                    1024
                )
            ).toFixed(
                1
            ) +
            " GB"
        );

    },


    // ========================================================
    // GERAR ID
    // ========================================================

    gerarID() {

        return (
            Date.now().toString(
                36
            ) +
            "_" +
            Math.random()
                .toString(
                    36
                )
                .substring(
                    2,
                    10
                )
        );

    },


    // ========================================================
    // ESCAPE HTML
    // ========================================================

    escapeHTML(
        valor
    ) {

        return String(
            valor ??
            ""
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
    // ESCAPE JS
    // ========================================================

    escapeJS(
        valor
    ) {

        return String(
            valor ??
            ""
        )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            '\\"'
        )
        .replace(
            /\r/g,
            "\\r"
        )
        .replace(
            /\n/g,
            "\\n"
        );

    }

};


// ============================================================
// DISPONIBILIZAR GLOBALMENTE
// ============================================================

window.TVAdmin =
    TVAdmin;

window.AdminTV =
    TVAdmin;


// ============================================================
// INICIAR
// ============================================================

function iniciarTVAdmin() {

    const app =
        document.getElementById(
            "app"
        );


    if (!app) {

        return;

    }


    if (
        TVAdmin.estado.inicializado
    ) {

        return;

    }


    TVAdmin.iniciar();

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarTVAdmin
    );

}
else {

    iniciarTVAdmin();

}