
const ICONES = {
    erro: "bx-error-circle",
    sucesso: "bx-check-circle",
    confirmar: "bx-help-circle"
};

function criar(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;

    return elemento;
}

function abrir({ titulo, mensagem, tipo, botoes }) {
    return new Promise((resolve) => {
        const dialog = criar("dialog", `aviso aviso-${tipo}`);
        dialog.setAttribute("role", tipo === "erro" ? "alertdialog" : "dialog");

        const corpo = criar("div", "aviso-corpo");

        const cabecalho = criar("div", "aviso-cabecalho");
        const icone = criar("i", `bx ${ICONES[tipo]}`);
        icone.setAttribute("aria-hidden", "true");
        cabecalho.append(criar("strong", "aviso-titulo", titulo), icone);

        const texto = criar("p", "aviso-mensagem", mensagem);
        const acoes = criar("div", "aviso-acoes");

        botoes.forEach((definicao) => {
            const botao = criar("button", definicao.classe, definicao.texto);
            botao.type = "button";
            botao.autofocus = Boolean(definicao.foco);
            botao.addEventListener("click", () => dialog.close(definicao.valor));
            acoes.appendChild(botao);
        });

        corpo.append(cabecalho, texto, acoes);
        dialog.appendChild(corpo);

        dialog.addEventListener("click", (evento) => {
            if (evento.target === dialog) dialog.close("");
        });

   
        dialog.addEventListener("close", () => {
            dialog.remove();
            resolve(dialog.returnValue === "ok");
        });

        document.body.appendChild(dialog);
        dialog.showModal();
    });
}


export function mostrarAviso(mensagem, { titulo = "Atenção", tipo = "erro" } = {}) {
    return abrir({
        titulo,
        mensagem,
        tipo,
        botoes: [{ texto: "Entendi", valor: "ok", foco: true }]
    });
}

export function confirmar(
    mensagem,
    {
        titulo = "Confirmar",
        tipo = "confirmar",
        textoConfirmar = "Confirmar",
        textoCancelar = "Cancelar"
    } = {}
) {
    return abrir({
        titulo,
        mensagem,
        tipo,
        botoes: [
            { texto: textoCancelar, valor: "", classe: "aviso-cancelar" },
            { texto: textoConfirmar, valor: "ok", foco: true }
        ]
    });
}
