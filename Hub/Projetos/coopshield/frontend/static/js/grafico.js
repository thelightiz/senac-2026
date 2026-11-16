function atualizarDashboard() {
    const periodo = document.getElementById('filtro-periodo').value;

    fetch('/api/filtrar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        cache: 'no-store',
        body: JSON.stringify({
            periodo: periodo
        })
    })
    .then(response => response.json())
    .then(dados => {

        console.log(dados);

        if (dados.erro) {
            console.log(dados.erro);
            return;
        }

        document.getElementById('val-analises').textContent =
            dados.analises;

        document.getElementById('val-deteccoes').textContent =
            dados.deteccoes;

        document.getElementById('txt-alta-min').textContent =
            '%' + dados.tipos.altas_minuto;

        document.getElementById('bar-alta-min').style.width =
            dados.tipos.altas_minuto + '%';

        document.getElementById('txt-alta-mad').textContent =
            '%' + dados.tipos.altas_madrugada;

        document.getElementById('bar-alta-mad').style.width =
            dados.tipos.altas_madrugada + '%';

        document.getElementById('txt-outros').textContent =
            '%' + dados.tipos.outros;

        document.getElementById('bar-outros').style.width =
            dados.tipos.outros + '%';

        desenharGrafico(dados.labels, dados.grafico);
    })
    .catch(erro => {
        console.log("Erro:", erro);
    });
}

function desenharGrafico(labels, valores) {
    const canvas = document.getElementById('meuGraficoCanvas');

    if (!canvas) {
        return;
    }

    const contexto = canvas.getContext('2d');

    const largura = canvas.parentElement ? canvas.parentElement.clientWidth : 700;
    const altura = canvas.parentElement ? canvas.parentElement.clientHeight : 230;

    canvas.width = largura;
    canvas.height = altura;

    contexto.clearRect(0, 0, largura, altura);

    if (!Array.isArray(valores) || valores.length === 0) {
        return;
    }

    const esquerda = 45;
    const direita = 20;
    const cima = 20;
    const baixo = 30;

    const larguraGrafico = largura - esquerda - direita;
    const alturaGrafico = altura - cima - baixo;

    const numeros = valores.map(v => Number(v) || 0);
    let maiorValor = Math.max(...numeros);

    if (maiorValor < 1) {
        maiorValor = 1;
    }

    const linhasNoEixo = 5;
    const passo = Math.ceil(maiorValor / linhasNoEixo / 10) * 10 || 1;
    const maxEixo = Math.ceil(maiorValor / passo) * passo;

    for (let i = 0; i <= linhasNoEixo; i++) {
        const valorEixo = i * (maxEixo / linhasNoEixo);
        const y =
            cima +
            alturaGrafico -
            (valorEixo / maxEixo) * alturaGrafico;

        contexto.beginPath();
        contexto.moveTo(esquerda, y);
        contexto.lineTo(largura - direita, y);
        contexto.strokeStyle = '#e5e5e5';
        contexto.lineWidth = 1;
        contexto.stroke();

        contexto.fillStyle = '#555';
        contexto.font = '12px Arial';
        contexto.textAlign = 'right';
        contexto.fillText(
            Math.round(valorEixo),
            esquerda - 8,
            y + 4
        );
    }

    contexto.beginPath();

    for (let i = 0; i < numeros.length; i++) {
        let x;

        if (numeros.length === 1) {
            x = esquerda + larguraGrafico / 2;
        } else {
            x = esquerda + (larguraGrafico / (numeros.length - 1)) * i;
        }

        const y = cima + alturaGrafico - (numeros[i] / maxEixo) * alturaGrafico;

        if (i === 0) {
            contexto.moveTo(x, y);
        } else {
            contexto.lineTo(x, y);
        }
    }

    contexto.strokeStyle = '#3f9227';
    contexto.lineWidth = 3;
    contexto.stroke();

    for (let i = 0; i < numeros.length; i++) {
        let x;

        if (numeros.length === 1) {
            x = esquerda + larguraGrafico / 2;
        } else {
            x = esquerda + (larguraGrafico / (numeros.length - 1)) * i;
        }

        const y = cima + alturaGrafico - (numeros[i] / maxEixo) * alturaGrafico;

        contexto.beginPath();
        contexto.arc(x, y, 5, 0, Math.PI * 2);
        contexto.fillStyle = '#3f9227';
        contexto.fill();

        contexto.fillStyle = '#555';
        contexto.font = '12px Arial';
        contexto.textAlign = 'center';

        const label = Array.isArray(labels) && labels[i] ? labels[i] : '';
        contexto.fillText(label, x, altura - 8);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    atualizarDashboard();
});