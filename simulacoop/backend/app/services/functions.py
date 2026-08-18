
juros = float(input("Digite a taxa de juros: "))

parcelas = int(input("Digite o número de parcelas: "))

valor_inicial = float(input("Digite o valor do empréstimo: "))

sistema_amortizador = input("Qual se quer: 1 - SAC ou 2 - PRICE: ")


def Calculo_SAC(juros_SAC, parcelas_SAC, valor_SAC):


    total_a_pagar_SAC = valor_SAC 

    for i in range(parcelas_SAC):

        juros_SAC = (juros / 100) * valor_SAC

        amortizacao_SAC = valor_inicial / parcelas_SAC

        pagamento_SAC = juros_SAC + amortizacao_SAC

        total_a_pagar_SAC += juros_SAC

        valor_SAC -= amortizacao_SAC

        

        print(f"Juros: {juros_SAC:.2f}" )
        print(f"Amortização: {amortizacao_SAC:.2f}" )
        print(f"Pagamento: {pagamento_SAC:.2f}" )
        print(f"Saldo devedor: {valor_SAC:.2f}" )
        print(f"Total a pagar: {total_a_pagar_SAC:.2f} \n\n" )

    
    






def Calculo_PRICE(juros, parcelas, valor):

    taxa_juros = juros / 100

    if taxa_juros == 0:
        valor_parcela = valor / parcelas

    else:
        fator = (1 + taxa_juros) ** parcelas

        valor_parcela = (
            valor
            * (taxa_juros * fator)
            / (fator - 1)
        )

    saldo_devedor = valor
    total_juros = 0
    total_pago = 0

    print(
        f"{'Parcela':<10}"
        f"{'Saldo Inicial':<18}"
        f"{'Juros':<15}"
        f"{'Amortizacao':<18}"
        f"{'Pagamento':<15}"
        f"{'Saldo Final':<18}"
    )


    for numero in range(1, parcelas + 1):

        saldo_inicial = saldo_devedor

        juros_parcela = saldo_inicial * taxa_juros

        amortizacao = valor_parcela - juros_parcela

        saldo_devedor -= amortizacao

        if numero == parcelas:
            amortizacao = saldo_inicial
            valor_pagamento = saldo_inicial + juros_parcela
            saldo_devedor = 0
        else:
            valor_pagamento = valor_parcela

        total_juros += juros_parcela
        total_pago += valor_pagamento

        print(
            f"{numero:<10}"
            f"R$ {saldo_inicial:<15.2f}"
            f"R$ {juros_parcela:<12.2f}"
            f"R$ {amortizacao:<15.2f}"
            f"R$ {valor_pagamento:<12.2f}"
            f"R$ {saldo_devedor:<15.2f}"
        )

    print(f"Valor da parcela: R$ {valor_parcela:.2f}")
    print(f"Total de juros:   R$ {total_juros:.2f}")
    print(f"Total a pagar:    R$ {total_pago:.2f}")


if sistema_amortizador == "1":

    Calculo_SAC(juros, parcelas, valor_inicial)

elif sistema_amortizador == "2":

    Calculo_PRICE(juros, parcelas, valor_inicial)  

else:
    print("Iscrevi diretu bombah")