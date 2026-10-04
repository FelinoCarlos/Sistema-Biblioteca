import AbastractView from "./AbastractView.js";

export default class extends AbastractView {
    constructor() {
        super();
      this.setTitle("Pagina Inicial");
    }

    async getHtml() {
        return `
            <h1>Pagina Inicial</h1>
            <p>Bem vindo ao sistema de biblioteca</p>
        `;
    }
}