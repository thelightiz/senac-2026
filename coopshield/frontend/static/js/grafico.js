// 1. CÓDIGO DA BIBLIOTECA (REVISADO COM LINHAS, DIAS E NÚMEROS)
/*!
 * Chart.js v4.4.1
 * https://chartjs.org
 * (c) 2023 Chart.js Contributors
 * Released under the MIT License
 */
!function(t,e){"object"==typeof exports&&"undefined"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).Chart=e()}(this,(function(){"use strict";return class{constructor(t,e){this.ctx=t,this.config=e,this.render()}destroy(){this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height)}render(){const t=this.ctx,e=this.config.data;
t.clearRect(0,0,t.canvas.width,t.canvas.height);



const n=e.datasets[0].data,s=e.labels;
// Configurações de margem interna para os textos não sumirem
const paddingEsquerda=50,paddingDireita=20,paddingTopo=20,paddingBaixo=40;
const larguraGrafico=t.canvas.width-paddingEsquerda-paddingDireita;
const alturaGrafico=t.canvas.height-paddingTopo-paddingBaixo;


// CÓDIGO DA LINHA: DESENHA OS EIXOS SEPARADORES (L)

t.beginPath();
t.strokeStyle="#CCCCCC";
t.lineWidth=1;
// Linha Vertical (Separa o gráfico dos números)
t.moveTo(paddingEsquerda,paddingTopo);
t.lineTo(paddingEsquerda,paddingTopo+alturaGrafico);
// Linha Horizontal (Separa o gráfico dos dias da semana)
t.lineTo(paddingEsquerda+larguraGrafico,paddingTopo+alturaGrafico);
t.stroke();


// DESENHA O TRAÇADO VERDE DO GRÁFICO

t.beginPath();
t.strokeStyle=this.config.data.datasets[0].borderColor||"#3f9227";
t.lineWidth=this.config.data.datasets[0].borderWidth||3;
n.forEach(((e,h)=>{
    const r=paddingEsquerda+h*(larguraGrafico/(s.length-1));
    const c=paddingTopo+alturaGrafico-(e/5)*alturaGrafico;
    0===h?t.moveTo(r,c):t.lineTo(r,c);
}));
t.stroke();

// DESENHA AS BOLINHAS VERDES NOS VÉRTICES
n.forEach(((e,h)=>{
    const r=paddingEsquerda+h*(larguraGrafico/(s.length-1));
    const c=paddingTopo+alturaGrafico-(e/5)*alturaGrafico;
    t.beginPath();
    t.fillStyle="#3f9227";
    t.arc(r,c,5,0,2*Math.PI);
    t.fill();
}));


// DESENHA OS NÚMEROS DO EIXO LATERAL ESQUERDO (0 A 5)

t.fillStyle="#666";
t.font="12px sans-serif";
t.textAlign="end";
t.textBaseline="middle";
for(let e=0;e<=5;e++){
    const n=paddingTopo+alturaGrafico-(e/5)*alturaGrafico;
    t.fillText(e,paddingEsquerda-12,n); // Escreve o número recuado à esquerda da linha
}

// DESENHA OS DIAS DA SEMANA EMBAIXO DO GRÁFICO (SEG A SEX)

t.textAlign="center";
t.textBaseline="top";
s.forEach(((e,n)=>{
    const r=paddingEsquerda+n*(larguraGrafico/(s.length-1));
    t.fillText(e,r,paddingTopo+alturaGrafico+10); // Escreve o dia centralizado abaixo da linha
}));
}}}));


// 2. SUA LÓGICA DE INTEGRAÇÃO COM O FLASK
let instanciaDoGrafico = null;

function atualizarDashboard() {
    const periodoSelecionado = document.getElementById('filtro-periodo').value;

    fetch('/api/filtrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodo: periodoSelecionado })
    })
    .then(response => response.json())
    .then(dados => {
        // Atualiza os cards superiores
        document.getElementById('val-analises').textContent = dados.analises;
        document.getElementById('val-deteccoes').textContent = dados.deteccoes;

        // Atualiza as barras horizontais da direita
        document.getElementById('txt-alta-min').textContent = '%' + dados.tipos.altas_minuto;
        document.getElementById('bar-alta-min').style.width = dados.tipos.altas_minuto + '%';

        document.getElementById('txt-alta-mad').textContent = '%' + dados.tipos.altas_madrugada;
        document.getElementById('bar-alta-mad').style.width = dados.tipos.altas_madrugada + '%';

        document.getElementById('txt-outros').textContent = '%' + dados.tipos.outros;
        document.getElementById('bar-outros').style.width = dados.tipos.outros + '%';

        let labelsEixoX = ['seg', 'ter', 'qua', 'quin', 'sex'];
        if (dados.grafico.length !== 5) {
            labelsEixoX = Array.from({length: dados.grafico.length}, (_, i) => 'Ponto ' + (i + 1));
        }

        const canvasElement = document.getElementById('meuGraficoCanvas');
        if (!canvasElement) return;
        
        const ctx = canvasElement.getContext('2d');
        
        if (instanciaDoGrafico) {
            instanciaDoGrafico.destroy();
        }

        // Instancia o gráfico que foi definido no topo do arquivo
        instanciaDoGrafico = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labelsEixoX,
                datasets: [{
                    data: dados.grafico,
                    borderColor: '#3f9227',
                    borderWidth: 2
                }]
            }
        });
    })
    .catch(err => console.error("Erro na requisição assíncrona:", err));
}

document.addEventListener("DOMContentLoaded", function() {
    atualizarDashboard();
});