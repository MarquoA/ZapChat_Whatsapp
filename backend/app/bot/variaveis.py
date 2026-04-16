"""
variaveis.py
Gerencia variáveis dinâmicas do ZapChat.
Substitui tokens como (nome), (cpf), etc. pelo valor real da sessão.
"""

from datetime import datetime
import random
import re
import string


# ─── TODAS AS VARIÁVEIS DISPONÍVEIS ──────────────────────────────────────────
#
# Formato: "(chave)": ("Categoria", "Descrição legível")
# Usado tanto para substituição quanto para exibir o picker no frontend.
#
VARIAVEIS_DISPONIVEIS = {

    # ── Dados pessoais ────────────────────────────────────────────────────────
    "(nome)":               ("Contato", "Primeiro nome do contato"),
    "(sobrenome)":          ("Contato", "Sobrenome do contato"),
    "(nome_completo)":      ("Contato", "Nome completo do contato"),
    "(telefone)":           ("Contato", "Telefone/WhatsApp do contato"),
    "(email)":              ("Contato", "E-mail do contato"),
    "(cpf)":                ("Contato", "CPF do contato"),
    "(rg)":                 ("Contato", "RG do contato"),
    "(data_nascimento)":    ("Contato", "Data de nascimento"),
    "(idade)":              ("Contato", "Idade do contato"),
    "(genero)":             ("Contato", "Gênero do contato"),
    "(profissao)":          ("Contato", "Profissão do contato"),

    # ── Endereço ──────────────────────────────────────────────────────────────
    "(endereco)":           ("Endereço", "Endereço completo"),
    "(rua)":                ("Endereço", "Rua / Logradouro"),
    "(numero)":             ("Endereço", "Número do endereço"),
    "(complemento)":        ("Endereço", "Complemento"),
    "(bairro)":             ("Endereço", "Bairro"),
    "(cidade)":             ("Endereço", "Cidade"),
    "(estado)":             ("Endereço", "Estado (ex: SP)"),
    "(cep)":                ("Endereço", "CEP"),

    # ── Dados empresariais ────────────────────────────────────────────────────
    "(cnpj)":               ("Empresa", "CNPJ da empresa"),
    "(razao_social)":       ("Empresa", "Razão social"),
    "(nome_empresa)":       ("Empresa", "Nome fantasia da empresa"),
    "(cargo)":              ("Empresa", "Cargo do contato na empresa"),
    "(departamento)":       ("Empresa", "Departamento"),

    # ── Atendimento ───────────────────────────────────────────────────────────
    "(protocolo)":          ("Atendimento", "Número de protocolo gerado"),
    "(data_hoje)":          ("Atendimento", "Data de hoje (dd/mm/aaaa)"),
    "(hora_atual)":         ("Atendimento", "Hora atual (hh:mm)"),
    "(dia_semana)":         ("Atendimento", "Dia da semana por extenso"),
    "(atendente)":          ("Atendimento", "Nome do atendente humano"),
    "(canal)":              ("Atendimento", "Canal de origem (ex: WhatsApp)"),

    # ── Agendamento ───────────────────────────────────────────────────────────
    "(data_agendamento)":   ("Agendamento", "Data do agendamento"),
    "(hora_agendamento)":   ("Agendamento", "Hora do agendamento"),
    "(profissional)":       ("Agendamento", "Profissional / responsável"),
    "(servico)":            ("Agendamento", "Serviço agendado"),
    "(local)":              ("Agendamento", "Local / endereço do atendimento"),

    # ── Pedido / Venda ────────────────────────────────────────────────────────
    "(numero_pedido)":      ("Pedido", "Número do pedido"),
    "(produto)":            ("Pedido", "Produto ou item selecionado"),
    "(quantidade)":         ("Pedido", "Quantidade"),
    "(valor)":              ("Pedido", "Valor do pedido"),
    "(forma_pagamento)":    ("Pedido", "Forma de pagamento"),
    "(status_pedido)":      ("Pedido", "Status atual do pedido"),

    # ── Respostas livres coletadas no fluxo ───────────────────────────────────
    "(resposta_1)":         ("Fluxo", "1ª resposta livre coletada"),
    "(resposta_2)":         ("Fluxo", "2ª resposta livre coletada"),
    "(resposta_3)":         ("Fluxo", "3ª resposta livre coletada"),
    "(resposta_4)":         ("Fluxo", "4ª resposta livre coletada"),
    "(resposta_5)":         ("Fluxo", "5ª resposta livre coletada"),
    "(ultima_resposta)":    ("Fluxo", "Última resposta do usuário"),

    # ── Pet / Veterinária ─────────────────────────────────────────────────────
    "(nome_pet)":           ("Pet", "Nome do animal"),
    "(especie_pet)":        ("Pet", "Espécie (cão, gato, etc.)"),
    "(raca_pet)":           ("Pet", "Raça do animal"),
    "(idade_pet)":          ("Pet", "Idade do animal"),

    # ── Saúde / Clínica ───────────────────────────────────────────────────────
    "(especialidade)":      ("Saúde", "Especialidade médica"),
    "(medico)":             ("Saúde", "Nome do médico"),
    "(convenio)":           ("Saúde", "Plano de saúde / convênio"),
    "(numero_convenio)":    ("Saúde", "Número da carteirinha"),
    "(queixa)":             ("Saúde", "Queixa principal informada"),

    # ── Imobiliária ───────────────────────────────────────────────────────────
    "(tipo_imovel)":        ("Imóvel", "Tipo de imóvel (casa, apto, etc.)"),
    "(finalidade)":         ("Imóvel", "Compra, venda ou aluguel"),
    "(valor_imovel)":       ("Imóvel", "Valor do imóvel"),
    "(bairro_interesse)":   ("Imóvel", "Bairro de interesse"),
    "(corretor)":           ("Imóvel", "Nome do corretor"),

    # ── Educação ──────────────────────────────────────────────────────────────
    "(curso)":              ("Educação", "Curso de interesse"),
    "(turno)":              ("Educação", "Turno preferido"),
    "(nivel_ensino)":       ("Educação", "Nível de ensino"),
    "(matricula)":          ("Educação", "Número de matrícula"),
}


def gerar_protocolo() -> str:
    """Gera um número de protocolo único no formato ZAP-XXXXXXXX."""
    chars = string.ascii_uppercase + string.digits
    sufixo = ''.join(random.choices(chars, k=8))
    return f"ZAP-{sufixo}"


def substituir_variaveis(texto: str, sessao: dict) -> str:
    """
    Substitui todas as variáveis encontradas no texto pelos valores da sessão.

    Args:
        texto:  Texto do nó com variáveis, ex: "Olá (nome), seu protocolo é (protocolo)"
        sessao: Dicionário com os dados coletados na sessão atual

    Returns:
        Texto com todas as variáveis substituídas pelos valores reais.
        Variáveis sem valor na sessão ficam em branco.
    """
    if not texto:
        return texto

    agora = datetime.now()

    # Valores automáticos — gerados em tempo real, não dependem da sessão
    automaticos = {
        "(data_hoje)":  agora.strftime("%d/%m/%Y"),
        "(hora_atual)": agora.strftime("%H:%M"),
        "(dia_semana)": _dia_semana_ptbr(agora),
        "(protocolo)":  sessao.get("protocolo") or gerar_protocolo(),
        "(canal)":      "WhatsApp",
    }

    for variavel in VARIAVEIS_DISPONIVEIS:
        if variavel not in texto:
            continue

        # Prioridade: valor na sessão > valor automático > string vazia
        if variavel in automaticos:
            valor = automaticos[variavel]
        else:
            # Remove parênteses para buscar na sessão: "(nome)" → "nome"
            chave = variavel[1:-1]
            valor = str(sessao.get(chave, "")).strip()

        texto = texto.replace(variavel, valor)

    # Substituição genérica: variáveis customizadas capturadas no fluxo
    # ex: (cpf), (dia_consulta), etc. que não estão em VARIAVEIS_DISPONIVEIS
    for m in re.findall(r'\([a-z_][a-z0-9_]*\)', texto):
        chave = m[1:-1]
        if chave in sessao and sessao[chave]:
            texto = texto.replace(m, str(sessao[chave]).strip())

    return texto


def montar_resumo_sessao(sessao: dict, campos: list | None = None) -> str:
    """
    Monta a mensagem de resumo da sessão.

    Args:
        sessao: Dicionário com os dados coletados
        campos: Lista de chaves que devem aparecer no resumo.
                Se None, inclui tudo que foi preenchido.

    Returns:
        Texto formatado para enviar como mensagem WhatsApp.
    """
    linhas = ["*Resumo do atendimento*\n"]

    labels = {
        "nome":              "Nome",
        "sobrenome":         "Sobrenome",
        "nome_completo":     "Nome completo",
        "telefone":          "Telefone",
        "email":             "E-mail",
        "cpf":               "CPF",
        "rg":                "RG",
        "cnpj":              "CNPJ",
        "endereco":          "Endereço",
        "cidade":            "Cidade",
        "estado":            "Estado",
        "cep":               "CEP",
        "data_agendamento":  "Data",
        "hora_agendamento":  "Horário",
        "profissional":      "Profissional",
        "servico":           "Serviço",
        "especialidade":     "Especialidade",
        "medico":            "Médico",
        "produto":           "Produto",
        "valor":             "Valor",
        "numero_pedido":     "Nº Pedido",
        "forma_pagamento":   "Pagamento",
        "nome_pet":          "Pet",
        "especie_pet":       "Espécie",
        "curso":             "Curso",
        "tipo_imovel":       "Tipo de imóvel",
        "protocolo":         "Protocolo",
        "resposta_1":        "Informação 1",
        "resposta_2":        "Informação 2",
        "resposta_3":        "Informação 3",
    }

    chaves_para_exibir = campos if campos else list(labels.keys())

    for chave in chaves_para_exibir:
        valor = str(sessao.get(chave, "")).strip()
        if not valor:
            continue
        label = labels.get(chave, chave.replace("_", " ").title())
        linhas.append(f"{label}: {valor}")

    # Protocolo sempre aparece no final se ainda não foi incluído
    if not campos or "protocolo" not in campos:
        protocolo = sessao.get("protocolo") or gerar_protocolo()
        linhas.append(f"\nProtocolo: {protocolo}")

    return "\n".join(linhas)


def _dia_semana_ptbr(data: datetime) -> str:
    dias = ["Segunda-feira", "Terça-feira", "Quarta-feira",
            "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"]
    return dias[data.weekday()]


def listar_variaveis_por_categoria() -> dict:
    """
    Retorna as variáveis agrupadas por categoria.
    Usado pelo endpoint que alimenta o picker do frontend.
    """
    categorias: dict[str, list] = {}
    for variavel, (categoria, descricao) in VARIAVEIS_DISPONIVEIS.items():
        if categoria not in categorias:
            categorias[categoria] = []
        categorias[categoria].append({
            "variavel": variavel,
            "descricao": descricao,
        })
    return categorias
