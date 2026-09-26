const StorageTV = {

    salvarTV(id) {

        localStorage.setItem(
            "tv_id",
            id
        );

    },


    carregarTV() {

        return localStorage.getItem(
            "tv_id"
        );

    },


    salvarGrupo(grupo) {

        localStorage.setItem(
            "tv_grupo",
            grupo
        );

    },


    carregarGrupo() {

        return localStorage.getItem(
            "tv_grupo"
        );

    }

};