class UrnaEletronica {
    constructor() {
        this.quantidadeVotantes = 0;
        this.votanteAtual = 0;
        this.screen = document.getElementById('screen');
        
        // Contadores de votos
        this.votos = {
            representante: { pedro: 0, joao: 0, rogerio: 0 },
            monitor: { pedro: 0, gabriel: 0, marcelo: 0 },
            orador: { matheus: 0, daniel: 0, felipe: 0 }
        };

        // Candidatos por posição
        this.candidatos = {
            representante: [
                { numero: 1, nome: 'Pedro' },
                { numero: 2, nome: 'João' },
                { numero: 3, nome: 'Rogério' }
            ],
            monitor: [
                { numero: 1, nome: 'Pedro' },
                { numero: 2, nome: 'Gabriel' },
                { numero: 3, nome: 'Marcelo' }
            ],
            orador: [
                { numero: 1, nome: 'Matheus' },
                { numero: 2, nome: 'Daniel' },
                { numero: 3, nome: 'Felipe' }
            ]
        };

        this.votosAtuais = {};
        this.posicaoAtual = 'representante';
        this.posicoes = ['representante', 'monitor', 'orador'];
        this.indicePosicao = 0;

        this.init();
    }

    init() {
        this.showConfigScreen();
    }

    showConfigScreen() {
        this.screen.innerHTML = `
            <div class="config-screen">
                <h2>⚙️ Configuração da Votação</h2>
                <div class="input-group">
                    <label for="quantidadeVotantes">Quantas pessoas irão votar?</label>
                    <input type="number" id="quantidadeVotantes" min="1" max="100" value="1">
                </div>
                <div class="controls">
                    <button class="btn btn-primary" onclick="urna.iniciarVotacao()">
                        Iniciar Votação
                    </button>
                </div>
            </div>
        `;
    }

    iniciarVotacao() {
        const input = document.getElementById('quantidadeVotantes');
        this.quantidadeVotantes = parseInt(input.value);
        
        if (this.quantidadeVotantes < 1) {
            alert('Por favor, informe um número válido de votantes.');
            return;
        }

        this.votanteAtual = 1;
        this.resetVotosAtuais();
        this.showVotingScreen();
    }

    resetVotosAtuais() {
        this.votosAtuais = {};
        this.posicaoAtual = 'representante';
        this.indicePosicao = 0;
    }

    showVotingScreen() {
        const posicaoNome = this.getPosicaoNome(this.posicaoAtual);
        
        this.screen.innerHTML = `
            <div class="voting-screen">
                <div class="voter-info">
                    👤 Votante ${this.votanteAtual} de ${this.quantidadeVotantes}
                </div>
                
                <div class="position-voting">
                    <h3>Vote para ${posicaoNome.toUpperCase()}</h3>
                    <div class="candidates">
                        ${this.renderCandidates()}
                    </div>
                </div>

                ${this.votosAtuais[this.posicaoAtual] ? this.renderVoteSummary() : ''}

                <div class="controls">
                    ${this.votosAtuais[this.posicaoAtual] ? 
                        `<button class="btn btn-success" onclick="urna.proximaPosicao()">
                            ${this.indicePosicao < this.posicoes.length - 1 ? 'Próximo Cargo' : 'Confirmar Votos'}
                        </button>` : ''}
                </div>
            </div>
        `;
    }

    renderCandidates() {
        return this.candidatos[this.posicaoAtual].map(candidato => `
            <div class="candidate ${this.votosAtuais[this.posicaoAtual] === candidato.numero ? 'selected' : ''}" 
                 onclick="urna.votar('${this.posicaoAtual}', ${candidato.numero})">
                <div class="candidate-number">${candidato.numero}</div>
                <div class="candidate-name">${candidato.nome}</div>
            </div>
        `).join('');
    }

    renderVoteSummary() {
        const candidatoEscolhido = this.candidatos[this.posicaoAtual]
            .find(c => c.numero === this.votosAtuais[this.posicaoAtual]);
        
        return `
            <div class="vote-summary">
                <h3>✅ Voto Confirmado</h3>
                <div class="vote-item">
                    <span>${this.getPosicaoNome(this.posicaoAtual)}:</span>
                    <span>${candidatoEscolhido.nome} (${candidatoEscolhido.numero})</span>
                </div>
            </div>
        `;
    }

    votar(posicao, numero) {
        this.votosAtuais[posicao] = numero;
        this.showVotingScreen();
    }

    proximaPosicao() {
        this.indicePosicao++;
        
        if (this.indicePosicao < this.posicoes.length) {
            this.posicaoAtual = this.posicoes[this.indicePosicao];
            this.showVotingScreen();
        } else {
            this.confirmarVotos();
        }
    }

    confirmarVotos() {
        // Contabilizar votos
        this.contabilizarVoto('representante', this.votosAtuais.representante);
        this.contabilizarVoto('monitor', this.votosAtuais.monitor);
        this.contabilizarVoto('orador', this.votosAtuais.orador);

        this.votanteAtual++;
        
        if (this.votanteAtual <= this.quantidadeVotantes) {
            this.resetVotosAtuais();
            this.showVotingScreen();
        } else {
            this.showResults();
        }
    }

    contabilizarVoto(posicao, numeroVoto) {
        const candidatos = this.candidatos[posicao];
        const candidato = candidatos.find(c => c.numero === numeroVoto);
        
        if (candidato) {
            const nomeKey = candidato.nome.toLowerCase();
            this.votos[posicao][nomeKey]++;
        }
    }

    showResults() {
        const resultados = this.calcularResultados();
        
        this.screen.innerHTML = `
            <div class="results-screen">
                <h2>📊 RESULTADO FINAL</h2>
                
                ${this.renderResultadoPosicao('Representante de Turma', 'representante', resultados.representante)}
                ${this.renderResultadoPosicao('Monitor', 'monitor', resultados.monitor)}
                ${this.renderResultadoPosicao('Orador', 'orador', resultados.orador)}
                
                <div class="controls">
                    <button class="btn btn-primary" onclick="urna.novaEleicao()">
                        Nova Eleição
                    </button>
                </div>
            </div>
        `;
    }

    renderResultadoPosicao(titulo, posicao, resultado) {
        const votos = this.votos[posicao];
        const totalVotos = Object.values(votos).reduce((a, b) => a + b, 0);
        
        return `
            <div class="results-section">
                <h3>${titulo}</h3>
                ${Object.entries(votos).map(([nome, quantidade]) => {
                    const percentage = totalVotos > 0 ? (quantidade / totalVotos * 100) : 0;
                    const isWinner = resultado.vencedor && nome === resultado.vencedor.toLowerCase();
                    const isTie = resultado.empate;
                    
                    return `
                        <div class="result-item ${isWinner && !isTie ? 'winner' : ''} ${isTie && quantidade === Math.max(...Object.values(votos)) ? 'tie' : ''}">
                            <span>${nome.charAt(0).toUpperCase() + nome.slice(1)}</span>
                            <span>${quantidade} voto${quantidade !== 1 ? 's' : ''} (${percentage.toFixed(1)}%)</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%"></div>
                        </div>
                    `;
                }).join('')}
                
                <div style="text-align: center; margin-top: 15px; font-weight: bold; color: #f39c12;">
                    ${resultado.empate ? 
                        '🤝 EMPATE!' : 
                        resultado.vencedor ? `🏆 ELEITO: ${resultado.vencedor.toUpperCase()}` : '⚠️ Sem votos'
                    }
                </div>
            </div>
        `;
    }

    calcularResultados() {
        const resultados = {};
        
        for (const posicao in this.votos) {
            const votos = this.votos[posicao];
            const entries = Object.entries(votos);
            const maxVotos = Math.max(...Object.values(votos));
            const vencedores = entries.filter(([nome, quantidade]) => quantidade === maxVotos);
            
            if (vencedores.length > 1 || maxVotos === 0) {
                resultados[posicao] = { empate: true };
            } else if (vencedores.length > 0) {
                resultados[posicao] = { vencedor: vencedores[0][0] };
            } else {
                resultados[posicao] = { empate: true };
            }
        }
        
        return resultados;
    }

    getPosicaoNome(posicao) {
        const nomes = {
            representante: 'Representante de Turma',
            monitor: 'Monitor',
            orador: 'Orador'
        };
        return nomes[posicao];
    }

    novaEleicao() {
        // Reset completo
        this.quantidadeVotantes = 0;
        this.votanteAtual = 0;
        this.votos = {
            representante: { pedro: 0, joao: 0, rogerio: 0 },
            monitor: { pedro: 0, gabriel: 0, marcelo: 0 },
            orador: { matheus: 0, daniel: 0, felipe: 0 }
        };
        this.votosAtuais = {};
        this.posicaoAtual = 'representante';
        this.indicePosicao = 0;
        
        this.showConfigScreen();
    }
}

// Inicializar a urna quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    window.urna = new UrnaEletronica();
});