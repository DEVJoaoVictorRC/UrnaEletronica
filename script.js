class UrnaEletronica {
    constructor() {
        this.screen = document.getElementById('screen');
        this.eleitoresQueVotaram = new Set(); // Para controlar quem já votou
        
        // Contadores de votos
        this.votos = {
            representante: { 
                candidatos: { pedro: 0, joao: 0, rogerio: 0 },
                branco: 0,
                nulo: 0
            },
            monitor: { 
                candidatos: { pedro: 0, gabriel: 0, marcelo: 0 },
                branco: 0,
                nulo: 0
            },
            orador: { 
                candidatos: { matheus: 0, daniel: 0, felipe: 0 },
                branco: 0,
                nulo: 0
            }
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
        this.eleitorAtual = '';

        this.init();
    }

    init() {
        this.showLoginScreen();
    }

    showLoginScreen() {
        this.screen.innerHTML = `
            <div class="login-screen">
                <h2>🔐 Identificação do Eleitor</h2>
                <div class="input-group">
                    <label for="matricula">Digite sua matrícula:</label>
                    <input type="text" id="matricula" placeholder="Ex: 12345" maxlength="10">
                </div>
                <div class="controls">
                    <button class="btn btn-primary" onclick="urna.validarEleitor()">
                        Entrar
                    </button>
                    <button class="btn btn-warning" onclick="urna.showResultsAdmin()">
                        Ver Resultados
                    </button>
                </div>
            </div>
        `;
    }

    validarEleitor() {
        const matricula = document.getElementById('matricula').value.trim();
        
        if (!matricula) {
            this.showAlert('Por favor, digite uma matrícula válida.', 'error');
            return;
        }

        if (this.eleitoresQueVotaram.has(matricula)) {
            this.showAlert('Esta matrícula já votou! Cada eleitor pode votar apenas uma vez.', 'error');
            return;
        }

        this.eleitorAtual = matricula;
        this.resetVotosAtuais();
        this.showVotingScreen();
    }

    showAlert(message, type = 'error') {
        const alertClass = type === 'success' ? 'alert success' : 'alert';
        const currentContent = this.screen.innerHTML;
        this.screen.innerHTML = `
            <div class="${alertClass}">${message}</div>
            ${currentContent}
        `;
        
        setTimeout(() => {
            const alert = this.screen.querySelector('.alert');
            if (alert) {
                alert.remove();
            }
        }, 3000);
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
                    👤 Eleitor: ${this.eleitorAtual} | Cargo ${this.indicePosicao + 1} de ${this.posicoes.length}
                </div>
                
                <div class="position-voting">
                    <h3>Vote para ${posicaoNome.toUpperCase()}</h3>
                    <div class="candidates">
                        ${this.renderCandidates()}
                    </div>
                    
                    <div class="special-votes">
                        <div class="special-vote ${this.votosAtuais[this.posicaoAtual] === 'branco' ? 'selected' : ''}" 
                             onclick="urna.votar('${this.posicaoAtual}', 'branco')">
                            VOTO EM BRANCO
                        </div>
                        <div class="special-vote ${this.votosAtuais[this.posicaoAtual] === 'nulo' ? 'selected' : ''}" 
                             onclick="urna.votar('${this.posicaoAtual}', 'nulo')">
                            VOTO NULO
                        </div>
                    </div>
                </div>

                <div class="controls">
                    ${this.votosAtuais[this.posicaoAtual] ? 
                        `<button class="btn btn-success" onclick="urna.proximaPosicao()">
                            ${this.indicePosicao < this.posicoes.length - 1 ? 'Próximo Cargo' : 'Revisar Votos'}
                        </button>` : 
                        '<p style="color: #bdc3c7; text-align: center;">Selecione uma opção para continuar</p>'}
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

    votar(posicao, voto) {
        this.votosAtuais[posicao] = voto;
        this.showVotingScreen();
    }

    proximaPosicao() {
        this.indicePosicao++;
        
        if (this.indicePosicao < this.posicoes.length) {
            this.posicaoAtual = this.posicoes[this.indicePosicao];
            this.showVotingScreen();
        } else {
            this.showConfirmationScreen();
        }
    }

    showConfirmationScreen() {
        this.screen.innerHTML = `
            <div class="confirmation-screen">
                <h2>📋 CONFIRMAÇÃO DOS VOTOS</h2>
                <p style="color: #bdc3c7; text-align: center; margin-bottom: 20px;">
                    Eleitor: <strong>${this.eleitorAtual}</strong>
                </p>
                
                <div class="vote-review">
                    <h3>Revise seus votos:</h3>
                    ${this.renderVoteReview()}
                </div>
                
                <div class="controls">
                    <button class="btn btn-danger" onclick="urna.voltarVotacao()">
                        ← Voltar e Alterar
                    </button>
                    <button class="btn btn-success" onclick="urna.confirmarVotos()">
                        ✓ Confirmar Votos
                    </button>
                </div>
            </div>
        `;
    }

    renderVoteReview() {
        return this.posicoes.map(posicao => {
            const voto = this.votosAtuais[posicao];
            const posicaoNome = this.getPosicaoNome(posicao);
            let votoTexto = '';

            if (voto === 'branco') {
                votoTexto = 'VOTO EM BRANCO';
            } else if (voto === 'nulo') {
                votoTexto = 'VOTO NULO';
            } else {
                const candidato = this.candidatos[posicao].find(c => c.numero === voto);
                votoTexto = candidato ? `${candidato.nome} (${candidato.numero})` : 'Não selecionado';
            }

            return `
                <div class="vote-item">
                    <span><strong>${posicaoNome}:</strong></span>
                    <span>${votoTexto}</span>
                </div>
            `;
        }).join('');
    }

    voltarVotacao() {
        this.indicePosicao = 0;
        this.posicaoAtual = this.posicoes[0];
        this.showVotingScreen();
    }

    confirmarVotos() {
        // Registrar que este eleitor já votou
        this.eleitoresQueVotaram.add(this.eleitorAtual);
        
        // Contabilizar votos
        this.posicoes.forEach(posicao => {
            this.contabilizarVoto(posicao, this.votosAtuais[posicao]);
        });

        this.showSuccessScreen();
    }

    contabilizarVoto(posicao, voto) {
        if (voto === 'branco') {
            this.votos[posicao].branco++;
        } else if (voto === 'nulo') {
            this.votos[posicao].nulo++;
        } else {
            const candidato = this.candidatos[posicao].find(c => c.numero === voto);
            if (candidato) {
                const nomeKey = candidato.nome.toLowerCase();
                this.votos[posicao].candidatos[nomeKey]++;
            }
        }
    }

    showSuccessScreen() {
        this.screen.innerHTML = `
            <div class="confirmation-screen">
                <div class="alert success">
                    ✅ VOTO REGISTRADO COM SUCESSO!
                </div>
                <h2>🎉 Obrigado por votar!</h2>
                <p style="color: #bdc3c7; text-align: center; margin: 20px 0;">
                    Eleitor: <strong>${this.eleitorAtual}</strong><br>
                    Seus votos foram registrados com segurança.
                </p>
                
                <div class="controls">
                    <button class="btn btn-primary" onclick="urna.proximoEleitor()">
                        Próximo Eleitor
                    </button>
                    <button class="btn btn-warning" onclick="urna.showResults()">
                        Ver Resultados
                    </button>
                </div>
            </div>
        `;
    }

    proximoEleitor() {
        this.eleitorAtual = '';
        this.resetVotosAtuais();
        this.showLoginScreen();
    }

    showResults() {
        this.showResultsAdmin();
    }

    showResultsAdmin() {
        const totalEleitores = this.eleitoresQueVotaram.size;
        const resultados = this.calcularResultados();
        
        this.screen.innerHTML = `
            <div class="results-screen">
                <h2>📊 APURAÇÃO DETALHADA</h2>
                <p style="color: #bdc3c7; text-align: center; margin-bottom: 30px;">
                    Total de eleitores que votaram: <strong>${totalEleitores}</strong>
                </p>
                
                ${this.renderResultadoPosicao('Representante de Turma', 'representante', resultados.representante)}
                ${this.renderResultadoPosicao('Monitor', 'monitor', resultados.monitor)}
                ${this.renderResultadoPosicao('Orador', 'orador', resultados.orador)}
                
                <div class="controls">
                    <button class="btn btn-primary" onclick="urna.proximoEleitor()">
                        Continuar Votação
                    </button>
                    <button class="btn btn-danger" onclick="urna.novaEleicao()">
                        Nova Eleição
                    </button>
                </div>
            </div>
        `;
    }

    renderResultadoPosicao(titulo, posicao, resultado) {
        const votos = this.votos[posicao];
        const votosCandidatos = votos.candidatos;
        const totalVotos = Object.values(votosCandidatos).reduce((a, b) => a + b, 0) + votos.branco + votos.nulo;
        
        return `
            <div class="results-section">
                <h3>${titulo}</h3>
                
                <h4 style="color: #3498db; margin: 15px 0;">📋 Candidatos:</h4>
                ${Object.entries(votosCandidatos).map(([nome, quantidade]) => {
                    const percentage = totalVotos > 0 ? (quantidade / totalVotos * 100) : 0;
                    const isWinner = resultado.vencedor && nome === resultado.vencedor.toLowerCase();
                    const isTie = resultado.empate && resultado.vencedores && resultado.vencedores.includes(nome);
                    
                    return `
                        <div class="result-item ${isWinner && !resultado.empate ? 'winner' : ''} ${isTie ? 'tie' : ''}">
                            <span>${nome.charAt(0).toUpperCase() + nome.slice(1)}</span>
                            <span>${quantidade} voto${quantidade !== 1 ? 's' : ''} (${percentage.toFixed(1)}%)</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%"></div>
                        </div>
                    `;
                }).join('')}
                
                <h4 style="color: #95a5a6; margin: 15px 0;">📄 Votos Especiais:</h4>
                <div class="result-item">
                    <span>Votos em Branco</span>
                    <span>${votos.branco} voto${votos.branco !== 1 ? 's' : ''} (${totalVotos > 0 ? (votos.branco / totalVotos * 100).toFixed(1) : 0}%)</span>
                </div>
                <div class="result-item">
                    <span>Votos Nulos</span>
                    <span>${votos.nulo} voto${votos.nulo !== 1 ? 's' : ''} (${totalVotos > 0 ? (votos.nulo / totalVotos * 100).toFixed(1) : 0}%)</span>
                </div>
                
                <div style="text-align: center; margin-top: 15px; font-weight: bold; color: #f39c12;">
                    ${resultado.empate ? 
                        `🤝 EMPATE! Candidatos empatados: ${resultado.vencedores.map(v => v.toUpperCase()).join(', ')}` : 
                        resultado.vencedor ? `🏆 MAIS VOTADO: ${resultado.vencedor.toUpperCase()}` : 
                        totalVotos === 0 ? '⚠️ Nenhum voto registrado' : '⚠️ Apenas votos especiais'
                    }
                </div>
            </div>
        `;
    }

    calcularResultados() {
        const resultados = {};
        
        for (const posicao in this.votos) {
            const votosCandidatos = this.votos[posicao].candidatos;
            const entries = Object.entries(votosCandidatos);
            const maxVotos = Math.max(...Object.values(votosCandidatos));
            const vencedores = entries.filter(([nome, quantidade]) => quantidade === maxVotos && quantidade > 0);
            
            if (vencedores.length > 1) {
                resultados[posicao] = { 
                    empate: true, 
                    vencedores: vencedores.map(([nome]) => nome) 
                };
            } else if (vencedores.length === 1) {
                resultados[posicao] = { vencedor: vencedores[0][0] };
            } else {
                resultados[posicao] = { vencedor: null };
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
        if (confirm('Tem certeza que deseja iniciar uma nova eleição? Todos os votos atuais serão perdidos.')) {
            // Reset completo
            this.eleitoresQueVotaram.clear();
            this.votos = {
                representante: { 
                    candidatos: { pedro: 0, joao: 0, rogerio: 0 },
                    branco: 0,
                    nulo: 0
                },
                monitor: { 
                    candidatos: { pedro: 0, gabriel: 0, marcelo: 0 },
                    branco: 0,
                    nulo: 0
                },
                orador: { 
                    candidatos: { matheus: 0, daniel: 0, felipe: 0 },
                    branco: 0,
                    nulo: 0
                }
            };
            this.votosAtuais = {};
            this.posicaoAtual = 'representante';
            this.indicePosicao = 0;
            this.eleitorAtual = '';
            
            this.showLoginScreen();
        }
    }
}

// Inicializar a urna quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    window.urna = new UrnaEletronica();
});