
const form = document.querySelector("#formLivro");
const dialog = document.querySelector("#dialogLivro");
const listaLivros = document.querySelector("#lista-livros");
const campoBusca = document.querySelector("#busca");
const resultadoInfo = document.querySelector("#resultado-info");
const tituloDialog = document.querySelector("#tituloDialog");
const campoImagem = document.querySelector("#imagem");
const campoCategoriaLivro = document.querySelector("#categoriaLivro");
const filtroCategoria = document.querySelector("#categoria");

const CHAVE_LIVROS = "db_livros";

let livroEditandoId = null;

// Busca os livros salvos no navegador
function buscarLivros() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE_LIVROS)) ?? [];
    } catch {
        return [];
    }
}

// aqui estamos Salvando os livros no navegador
function salvarLivros(livros) {
    localStorage.setItem(CHAVE_LIVROS, JSON.stringify(livros));
}

// função para abrir a janela de cadastro
document.querySelectorAll("#btn-button").forEach((button) => {
    button.addEventListener("click", () => {
        const janela = document.getElementById(button.dataset.dialog);

        if (janela) {
            form.reset();
            livroEditandoId = null;
            tituloDialog.textContent = "Adicionar Livro";
            janela.showModal();
        }
    });
});

// Fecha a janela
document.querySelectorAll(".close").forEach((button) => {
    button.addEventListener("click", () => {
        button.closest("dialog").close();
        form.reset();
        livroEditandoId = null;
        tituloDialog.textContent = "Adicionar Livro";
    });
});

// Aqui estamos criando uma janela que Converte a imagem selecionada em dados que podem ser salvos
function lerImagem(arquivo) {
    return new Promise((resolve, reject) => {
        if (!arquivo) {
            resolve(null);
            return;
        }

        if (!arquivo.type.startsWith("image/")) {
            reject(new Error("Selecione um arquivo de imagem válido."));
            return;
        }

        if (arquivo.size > 500 * 1024) {
            reject(new Error("A imagem deve ter no máximo 500 KB."));
            return;
        }

        const leitor = new FileReader();

        leitor.onload = () => resolve(leitor.result);
        leitor.onerror = () => reject(new Error("Não foi possível ler a imagem."));

        leitor.readAsDataURL(arquivo);
    });
}

// Cadastra ou atualiza um livro
form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const titulo = document.querySelector("#titulo").value.trim();
    const autor = document.querySelector("#autor").value.trim();
    const quantidade = Number(document.querySelector("#quantidade").value);
    const categoriaLivro = campoCategoriaLivro.value;

    if (!titulo || !autor || !Number.isInteger(quantidade) || quantidade < 1) {
        alert("Preencha os campos corretamente.");
        return;
    }

    const livros = buscarLivros();

    const livroAtual = livros.find(
        (livro) => livro.id === livroEditandoId
    );

    try {
        const arquivo = campoImagem.files[0];
        const novaImagem = await lerImagem(arquivo);

        const emprestados = livroAtual
            ? livroAtual.quantidade - livroAtual.disponivel
            : 0;

        if (quantidade < emprestados) {
            alert("A quantidade não pode ser menor que os livros emprestados.");
            return;
        }

        const livro = {
            id: livroAtual
                ? livroAtual.id
                : `${Date.now()}-${Math.random()}`,
            titulo,
            autor,
            categoria: categoriaLivro,
            quantidade,
            disponivel: quantidade - emprestados,
            imagem: novaImagem ?? livroAtual?.imagem ?? ""
        };

        if (livroAtual) {
            const indice = livros.findIndex(
                (item) => item.id === livroEditandoId
            );

            livros[indice] = livro;
        } else {
            livros.push(livro);
        }

        salvarLivros(livros);

        form.reset();
        dialog.close();
        livroEditandoId = null;
        tituloDialog.textContent = "Adicionar Livro";

        mostrarLivros();

        alert(livroAtual ? "Livro atualizado!" : "Livro cadastrado!");
    } catch (erro) {
        alert(
            erro.name === "QuotaExceededError"
                ? "O armazenamento está cheio. Tente usar imagens menores."
                : erro.message || "Não foi possível salvar o livro."
        );
    }
});

// Cria um elemento HTML com texto seguro
function criarElemento(tag, texto, classe) {
    const elemento = document.createElement(tag);
    elemento.textContent = texto;

    if (classe) {
        elemento.className = classe;
    }

    return elemento;
}

// Edita um livro
function editarLivro(id) {
    const livro = buscarLivros().find((item) => item.id === id);

    if (!livro) return;

    livroEditandoId = id;

    document.querySelector("#titulo").value = livro.titulo;
    document.querySelector("#autor").value = livro.autor;
    campoCategoriaLivro.value = livro.categoria || "";
    document.querySelector("#quantidade").value = livro.quantidade;

    campoImagem.value = "";
    tituloDialog.textContent = "Editar Livro";

    dialog.showModal();
}

// Exclui um livro
function excluirLivro(id) {
    if (!confirm("Tem certeza que deseja excluir este livro?")) {
        return;
    }

    const livros = buscarLivros();
    const livro = livros.find((item) => item.id === id);

    if (livro && livro.disponivel < livro.quantidade) {
        alert("Este livro possui exemplares emprestados e não pode ser excluído.");
        return;
    }

    try {
        salvarLivros(livros.filter((item) => item.id !== id));
        mostrarLivros();
    } catch {
        alert("Não foi possível atualizar o catálogo.");
    }
}

// Desenha os livros na tela
    const livros = buscarLivros();
    const termo = campoBusca.value.trim().toLowerCase();
    const categoriaSelecionada = filtroCategoria.value;

    const filtrados = livros.filter((livro) => {
    const correspondeBusca =
        livro.titulo.toLowerCase().includes(termo) ||
        livro.autor.toLowerCase().includes(termo);

    const correspondeCategoria =
        categoriaSelecionada === "todas" ||
        livro.categoria === categoriaSelecionada;

    return correspondeBusca && correspondeCategoria;
    });

    listaLivros.replaceChildren();

    resultadoInfo.textContent =
        `${filtrados.length} livro(s) encontrado(s)`;

    if (filtrados.length === 0) {
        listaLivros.appendChild(
            criarElemento("p", "Nenhum livro encontrado.", "mensagem-vazia")
        );
        return;
    }

    filtrados.forEach((livro) => {
        const card = criarElemento("article", "", "livro-card");

        if (livro.imagem) {
            const imagem = document.createElement("img");
            imagem.src = livro.imagem;
            imagem.alt = `Capa do livro ${livro.titulo}`;
            imagem.className = "livro-imagem";
            card.appendChild(imagem);
        }

        card.appendChild(criarElemento("h3", livro.titulo));
        card.appendChild(criarElemento("p", `Autor: ${livro.autor}`));
        card.appendChild(
        criarElemento("p", `Categoria: ${livro.categoria || "Não definida"}`)
        );

        card.appendChild(
            criarElemento(
                "p",
                `Disponíveis: ${livro.disponivel} de ${livro.quantidade}`
            )
        );

        const acoes = criarElemento("div", "", "livro-acoes");

        const botaoEditar = criarElemento("button", "Editar");
        botaoEditar.type = "button";
        botaoEditar.addEventListener("click", () => editarLivro(livro.id));

        const botaoExcluir = criarElemento("button", "Excluir");
        botaoExcluir.type = "button";
        botaoExcluir.addEventListener("click", () => excluirLivro(livro.id));

        acoes.append(botaoEditar, botaoExcluir);
        card.appendChild(acoes);
        listaLivros.appendChild(card);
    });

// Pesquisa enquanto você digita

campoBusca.addEventListener("input", mostrarLivros);
filtroCategoria.addEventListener("change", mostrarLivros);

// Exibe os livros salvos quando a página abre
mostrarLivros();