import * as emprestimo from "./emprestimo.js";
import * as catalogo from "./catalogo.js";
import * as cliente from "./cliente.js";

export function mount() {
    /* ---------- Máscaras ---------- */
    const telefone = document.querySelector("#telefone");
    telefone?.addEventListener("input", () => {
        let v = telefone.value.replace(/\D/g, "").slice(0, 11);
        v = v.replace(/^(\d{2})(\d)/, "($1) $2");
        v = v.replace(/(\d{5})(\d{1,4})$/, "$1-$2");
        telefone.value = v;
    });

    const cpf = document.querySelector("#cpf");
    cpf?.addEventListener("input", () => {
        let v = cpf.value.replace(/\D/g, "").slice(0, 11);
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        cpf.value = v;
    });

    /* ---------- Liga os botões reaproveitando os outros módulos ---------- */
    const limpezas = [];

    try { limpezas.push(emprestimo.mount()); }
    catch (e) { console.error("emprestimo.mount falhou na home:", e); }

    try { limpezas.push(cliente.mount()); }
    catch (e) { console.error("cliente.mount falhou na home:", e); }

    try { limpezas.push(catalogo.mount()); }
    catch (e) { console.error("catalogo.mount falhou na home:", e); }

    /* ---------- Relógio ---------- */
    const timeDisplay = document.getElementById("time");

    function refreshTime() {
        const dateString = new Date().toLocaleString("pt-BR", {
            timeZone: "America/Sao_Paulo"
        });
        if (timeDisplay) timeDisplay.textContent = dateString.replace(", ", " - ");
    }

    refreshTime();
    const timer = setInterval(refreshTime, 1000);

    /* ---------- Chaves ---------- */
    const CHAVE_EMPRESTIMOS = "db_emprestimos";
    const CHAVE_LIVROS = "db_livros";
    const CHAVE_CLIENTES = "db_items";

    /* ---------- Elementos ---------- */
    const tbody = document.querySelector("#tabelaAtrasados");
    const mensagem = document.querySelector("#mensagemAtrasados");
    const totalEmprestimos = document.querySelector("#totalEmprestimos");
    const totalClientes = document.querySelector("#totalClientes");

    /* ---------- Armazenamento ---------- */
    function ler(chave) {
        try {
            const dados = JSON.parse(localStorage.getItem(chave) || "[]");
            return Array.isArray(dados) ? dados : [];
        } catch {
            return [];
        }
    }

    const salvar = (chave, dados) =>
        localStorage.setItem(chave, JSON.stringify(dados));

    const somenteNumeros = (texto) => String(texto ?? "").replace(/\D/g, "");

    /* ---------- Datas ---------- */
    function formatarISO(data) {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");
        return `${ano}-${mes}-${dia}`;
    }

    const hojeISO = () => formatarISO(new Date());

    function exibirData(iso) {
        if (!iso) return "-";
        const [ano, mes, dia] = iso.split("-");
        return `${dia}/${mes}/${ano}`;
    }

    function diasDeAtraso(dataPrevista) {
        const [a, m, d] = dataPrevista.split("-").map(Number);
        const prevista = new Date(a, m - 1, d);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        return Math.round((hoje - prevista) / 86400000);
    }

    /* ---------- Regras ---------- */
    const estaAtrasado = (e) => !e.dataDevolucao && hojeISO() > e.dataPrevista;

    function nomeDoCliente(cpfEmprestimo) {
        const c = ler(CHAVE_CLIENTES).find(
            (x) => somenteNumeros(x.cpf) === cpfEmprestimo
        );
        return c ? c.nome : "Cliente removido";
    }

    function tituloDoLivro(livroId) {
        const livro = ler(CHAVE_LIVROS).find((l) => l.id === livroId);
        return livro ? livro.titulo : "Livro removido";
    }

    /* ---------- Devolução ---------- */
    function devolver(id) {
        const emprestimos = ler(CHAVE_EMPRESTIMOS);
        const emp = emprestimos.find((e) => e.id === id);

        if (!emp || emp.dataDevolucao) return;
        if (!confirm("Confirmar a devolução deste livro?")) return;

        emp.dataDevolucao = hojeISO();

        const livros = ler(CHAVE_LIVROS);
        const livro = livros.find((l) => l.id === emp.livroId);

        if (livro) {
            livro.disponivel = Math.min(livro.disponivel + 1, livro.quantidade);
            salvar(CHAVE_LIVROS, livros);
        }

        salvar(CHAVE_EMPRESTIMOS, emprestimos);
        atualizarPainel();
    }

    /* ---------- Tabela de atrasados ---------- */
    function criarLinha(emp) {
        const tr = document.createElement("tr");

        [
            tituloDoLivro(emp.livroId),
            nomeDoCliente(emp.cpf),
            exibirData(emp.dataEmprestimo),
            exibirData(emp.dataPrevista),
            `${diasDeAtraso(emp.dataPrevista)} dia(s)`
        ].forEach((valor) => {
            const td = document.createElement("td");
            td.textContent = valor;
            tr.appendChild(td);
        });

        const tdAcao = document.createElement("td");
        tdAcao.className = "columnAction";

        const botao = document.createElement("button");
        botao.type = "button";
        botao.textContent = "Devolver";
        botao.addEventListener("click", () => devolver(emp.id));

        tdAcao.appendChild(botao);
        tr.appendChild(tdAcao);
        return tr;
    }

    function mostrarAtrasados() {
        const atrasados = ler(CHAVE_EMPRESTIMOS)
            .filter(estaAtrasado)
            .sort((a, b) => a.dataPrevista.localeCompare(b.dataPrevista));

        if (tbody) tbody.replaceChildren(...atrasados.map(criarLinha));
        if (mensagem) mensagem.textContent = atrasados.length;
    }

    /* ---------- Cards do painel ---------- */
    function atualizarPainel() {
        if (totalEmprestimos) {
            totalEmprestimos.textContent = ler(CHAVE_EMPRESTIMOS).length;
        }
        if (totalClientes) {
            totalClientes.textContent = ler(CHAVE_CLIENTES).length;
        }
        mostrarAtrasados();
    }

    /* ---------- Inicialização e atualização automática ---------- */
    atualizarPainel();

    const aoMudarStorage = (e) => {
        if ([CHAVE_EMPRESTIMOS, CHAVE_LIVROS, CHAVE_CLIENTES].includes(e.key)) {
            atualizarPainel();
        }
    };

    window.addEventListener("storage", aoMudarStorage);
    window.addEventListener("emprestimos-atualizados", atualizarPainel);

    // O roteador chama esta função ao sair da página
    return () => {
        clearInterval(timer);
        window.removeEventListener("storage", aoMudarStorage);
        window.removeEventListener("emprestimos-atualizados", atualizarPainel);
        limpezas.forEach((fn) => typeof fn === "function" && fn());
    };
}