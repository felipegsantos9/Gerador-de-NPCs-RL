let dadosNomes = {};
let dadosCidades = {};

async function carregarDados() {
    try {
        const respostaNomes = await fetch("./Nomes.txt");

        if (!respostaNomes.ok) {
            throw new Error("Não foi possível encontrar o arquivo Nomes.txt");
        }

        const textoNomes = await respostaNomes.text();

        dadosNomes = interpretarNomes(textoNomes);

        const respostaCidades = await fetch("./Cidades.txt");

        if (!respostaCidades.ok) {
            throw new Error("Não foi possível encontrar o arquivo Cidades.txt");
        }

        const textoCidades = await respostaCidades.text();

        dadosCidades = interpretarCidades(textoCidades);

        console.log("Nomes carregados:", dadosNomes);
        console.log("Cidades carregadas:", dadosCidades);

    } catch (erro) {
        console.error("Erro ao carregar arquivos:", erro);

        document.getElementById("nome").textContent =
            "Erro ao carregar os dados";

        alert(erro.message);
    }
}

function interpretarNomes(texto) {
    const dados = {};

    let origemAtual = null;
    let categoriaAtual = null;

    const linhas = texto.split(/\r?\n/);

    linhas.forEach(linha => {
        linha = linha.trim();

        if (!linha || linha.startsWith("=")) {
            return;
        }

        if (linha.startsWith("ORIGEM:")) {
            origemAtual = linha
                .replace("ORIGEM:", "")
                .trim();

            dados[origemAtual] = {
                masculinos: [],
                femininos: [],
                sobrenomes: []
            };

            categoriaAtual = null;

            return;
        }

        if (linha === "[MASCULINOS]") {
            categoriaAtual = "masculinos";
            return;
        }

        if (linha === "[FEMININOS]") {
            categoriaAtual = "femininos";
            return;
        }

        if (linha === "[SOBRENOMES]") {
            categoriaAtual = "sobrenomes";
            return;
        }

        if (
            origemAtual &&
            categoriaAtual
        ) {
            dados[origemAtual][categoriaAtual].push(linha);
        }
    });

    return dados;
}

function interpretarCidades(texto) {
    const dados = {};

    let origemAtual = null;
    let lendoCidades = false;

    const linhas = texto.split(/\r?\n/);

    linhas.forEach(linha => {
        linha = linha.trim();

        if (!linha || linha.startsWith("=")) {
            return;
        }

        if (linha.startsWith("ORIGEM:")) {
            origemAtual = linha
                .replace("ORIGEM:", "")
                .trim();

            dados[origemAtual] = [];

            lendoCidades = false;

            return;
        }

        if (linha === "[CIDADES]") {
            lendoCidades = true;
            return;
        }

        if (
            origemAtual &&
            lendoCidades
        ) {
            dados[origemAtual].push(linha);
        }
    });

    return dados;
}

function aleatorio(lista) {
    if (!lista || lista.length === 0) {
        return null;
    }

    const indice = Math.floor(
        Math.random() * lista.length
    );

    return lista[indice];
}

function escolherGenero() {
    return Math.random() < 0.5
        ? "masculino"
        : "feminino";
}

function escolherNacionalidade() {
    const nacionalidades =
        Object.keys(dadosNomes);

    return aleatorio(nacionalidades);
}

function escolherOrigem() {
    const origens =
        Object.keys(dadosNomes);

    return aleatorio(origens);
}

function gerarNome(origem, genero) {
    const dados = dadosNomes[origem];

    if (!dados) {
        return "Nome desconhecido";
    }

    let listaNomes;

    if (genero === "masculino") {
        listaNomes = dados.masculinos;
    } else {
        listaNomes = dados.femininos;
    }

    if (
        !listaNomes ||
        listaNomes.length === 0
    ) {
        return "Nome desconhecido";
    }

    const nome = aleatorio(listaNomes);

    if (
        !dados.sobrenomes ||
        dados.sobrenomes.length === 0
    ) {
        return nome;
    }

    if (origem === "BRASILEIRA") {
        return gerarNomeBrasileiro(
            nome,
            dados.sobrenomes
        );
    }

    const sobrenome =
        aleatorio(dados.sobrenomes);

    return `${nome} ${sobrenome}`;
}

function gerarNomeBrasileiro(
    nome,
    sobrenomes
) {
    if (sobrenomes.length === 1) {
        return `${nome} ${sobrenomes[0]}`;
    }

    const primeiro =
        aleatorio(sobrenomes);

    let segundo =
        aleatorio(sobrenomes);

    while (segundo === primeiro) {
        segundo =
            aleatorio(sobrenomes);
    }

    return `${nome} ${primeiro} ${segundo}`;
}

function encontrarCidades(nacionalidade) {
    if (dadosCidades[nacionalidade]) {
        return dadosCidades[nacionalidade];
    }

    const equivalencias = {
        "INGLESA": "BRITÂNICA"
    };

    const equivalente =
        equivalencias[nacionalidade];

    if (
        equivalente &&
        dadosCidades[equivalente]
    ) {
        return dadosCidades[equivalente];
    }

    return [];
}

function gerarCidade(nacionalidade) {
    const cidades =
        encontrarCidades(nacionalidade);

    if (cidades.length === 0) {
        return "Cidade desconhecida";
    }

    return aleatorio(cidades);
}

function formatarTexto(texto) {
    if (!texto) {
        return "—";
    }

    return texto.charAt(0) +
        texto.slice(1).toLowerCase();
}

function gerarNPC() {
    if (
        Object.keys(dadosNomes).length === 0
    ) {
        alert(
            "Os arquivos de nomes ainda não foram carregados."
        );

        return;
    }

    const seletorNacionalidade =
        document.getElementById(
            "nacionalidade"
        );

    const seletorOrigem =
        document.getElementById(
            "origem"
        );

    const seletorGenero =
        document.getElementById(
            "genero"
        );

    let nacionalidade =
        seletorNacionalidade.value;

    let origem =
        seletorOrigem.value;

    let genero =
        seletorGenero.value;

    if (nacionalidade === "aleatorio") {
        nacionalidade =
            escolherNacionalidade();
    }

    if (origem === "aleatorio") {
        origem =
            escolherOrigem();
    }

    if (genero === "aleatorio") {
        genero =
            escolherGenero();
    }

    const nome =
        gerarNome(
            origem,
            genero
        );

    const cidade =
        gerarCidade(
            nacionalidade
        );

    document.getElementById(
        "nome"
    ).textContent = nome;

    document.getElementById(
        "generoResultado"
    ).textContent =
        genero === "masculino"
            ? "Masculino"
            : "Feminino";

    document.getElementById(
        "nacionalidadeResultado"
    ).textContent =
        formatarTexto(
            nacionalidade
        );

    document.getElementById(
        "origemResultado"
    ).textContent =
        formatarTexto(
            origem
        );

    document.getElementById(
        "cidade"
    ).textContent = cidade;

    console.log({
        nome: nome,
        genero: genero,
        nacionalidade: nacionalidade,
        origem: origem,
        cidade: cidade
    });
}

document.addEventListener(
    "DOMContentLoaded",
    () => {
        carregarDados();

        document
            .getElementById("gerarNPC")
            .addEventListener(
                "click",
                gerarNPC
            );
    }
);