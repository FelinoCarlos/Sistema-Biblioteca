import AbastractView from "./AbastractView.js";

export default class extends AbastractView {
    constructor() {
        super();
      this.setTitle("Emprestimos");
    }

    async getHtml() {
        return `
            <h1>Emprestimos</h1>
            <p>Bem vindo ao sistema de biblioteca</p>
        `;
    }
}