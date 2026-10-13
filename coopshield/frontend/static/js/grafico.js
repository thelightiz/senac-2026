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

    const largura = canvas.parentElement.clientWidth;
    const altura = canvas.parentElement.clientHeight;

    canvas.width = largura;
    canvas.height = altura;

    contexto.clearRect(0, 0, largura, altura);

    if (valores.length === 0) {
        return;
    }

    const esquerda = 45;
    const direita = 20;
    const cima = 20;
    const baixo = 30;

    const larguraGrafico =
        largura - esquerda - direita;

    const alturaGrafico =
        altura - cima - baixo;

    let maiorValor = Math.max(...valores);

    if (maiorValor < 1) {
        maiorValor = 1;
    }

    const quantidadeLinhas = maiorValor;

    for (let i = 0; i <= quantidadeLinhas; i++) {

        const y =
            cima +
            alturaGrafico -
            (i / maiorValor) * alturaGrafico;

        contexto.beginPath();

        contexto.moveTo(
            esquerda,
            y
        );

        contexto.lineTo(
            largura - direita,
            y
        );

        contexto.strokeStyle = '#e5e5e5';
        contexto.lineWidth = 1;
        contexto.stroke();

        contexto.fillStyle = '#555';
        contexto.font = '12px Arial';
        contexto.textAlign = 'right';

        contexto.fillText(
            i,
            esquerda - 8,
            y + 4
        );
    }

    contexto.beginPath();

    for (let i = 0; i < valores.length; i++) {

        let x;

        if (valores.length === 1) {
            x = esquerda + larguraGrafico / 2;
        } else {
            x =
                esquerda +
                (larguraGrafico / (valores.length - 1)) * i;
        }

        const y =
            cima +
            alturaGrafico -
            (valores[i] / maiorValor) * alturaGrafico;

        if (i === 0) {
            contexto.moveTo(x, y);
        } else {
            contexto.lineTo(x, y);
        }
    }

    contexto.strokeStyle = '#3f9227';
    contexto.lineWidth = 3;
    contexto.stroke();

    for (let i = 0; i < valores.length; i++) {

        let x;

        if (valores.length === 1) {
            x = esquerda + larguraGrafico / 2;
        } else {
            x =
                esquerda +
                (larguraGrafico / (valores.length - 1)) * i;
        }

        const y =
            cima +
            alturaGrafico -
            (valores[i] / maiorValor) * alturaGrafico;

        contexto.beginPath();

        contexto.arc(
            x,
            y,
            5,
            0,
            Math.PI * 2
        );

        contexto.fillStyle = '#3f9227';
        contexto.fill();

        contexto.fillStyle = '#555';
        contexto.font = '12px Arial';
        contexto.textAlign = 'center';

        contexto.fillText(
            labels[i],
            x,
            altura - 8
        );
    }
}

document.addEventListener("DOMContentLoaded", function() {
    atualizarDashboard();
});