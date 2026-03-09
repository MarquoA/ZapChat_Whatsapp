# app/bot/bot_engine.py
import json

class BotEngine:
    """
    Motor do bot — lê o fluxo salvo no banco e processa respostas.
    Funciona independente do WhatsApp (pode ser testado via /bot/simular).
    """

    def __init__(self, fluxo_json: str):
        dados = json.loads(fluxo_json) if isinstance(fluxo_json, str) else fluxo_json
        self.nodes = {node["id"]: node for node in dados.get("nodes", [])}
        self.edges = dados.get("edges", [])

    def get_no_inicial(self) -> dict | None:
        """Retorna o primeiro nó do fluxo (sem nenhuma edge apontando para ele)."""
        nos_destino = {edge["target"] for edge in self.edges}
        for node_id, node in self.nodes.items():
            if node_id not in nos_destino:
                return node
        # Fallback: retorna o nó de id "1" se existir
        return self.nodes.get("1")

    def get_no(self, node_id: str) -> dict | None:
        """Retorna um nó pelo ID."""
        return self.nodes.get(node_id)

    def processar_resposta(self, node_id_atual: str, mensagem_usuario: str) -> dict:
        """
        Processa a resposta do usuário e retorna o próximo nó.

        Retorna:
          {
            "encontrou": True/False,
            "proximo_node_id": "...",
            "mensagem": "...",
            "opcoes": [...],
            "delay": 2,
            "fim_fluxo": True/False
          }
        """
        node_atual = self.get_no(node_id_atual)
        if not node_atual:
            return self._resposta_erro("Nó não encontrado.")

        opcoes = node_atual["data"].get("options", [])
        mensagem_lower = mensagem_usuario.strip().lower()

        # Tenta encontrar a opção pelo número (1, 2, 3...) ou pelo texto exato
        handle_escolhido = None
        for i, opcao in enumerate(opcoes):
            numero = str(i + 1)
            texto_opcao = opcao.strip().lower()

            if mensagem_lower == numero or mensagem_lower == texto_opcao or texto_opcao.startswith(f"{numero} -") and mensagem_lower == numero:
                handle_escolhido = f"opt{i}"
                break

            # Verifica se o texto da opção contém o número no início (ex: "1 - Desejo testar")
            partes = opcao.split("-", 1)
            if len(partes) > 1 and partes[0].strip() == numero:
                if mensagem_lower == numero or mensagem_lower == partes[1].strip().lower():
                    handle_escolhido = f"opt{i}"
                    break

        # Se não encontrou opção específica e não tem opções, segue pelo handle "default"
        if handle_escolhido is None and len(opcoes) == 0:
            handle_escolhido = "default"

        # Busca a edge correspondente
        proximo_node_id = None
        if handle_escolhido:
            for edge in self.edges:
                if edge["source"] == node_id_atual and edge.get("sourceHandle") == handle_escolhido:
                    proximo_node_id = edge["target"]
                    break

        # Se não encontrou próximo nó — fallback
        if not proximo_node_id:
            # Verifica se existe um nó de fallback conectado (sem sourceHandle ou handle "fallback")
            for edge in self.edges:
                if edge["source"] == node_id_atual and edge.get("sourceHandle") in [None, "fallback", "default"]:
                    proximo_node_id = edge["target"]
                    break

        if not proximo_node_id:
            return {
                "encontrou": False,
                "proximo_node_id": node_id_atual,
                "mensagem": node_atual["data"].get("label", ""),
                "opcoes": opcoes,
                "delay": node_atual["data"].get("delay", 2),
                "fim_fluxo": False,
            }

        proximo_node = self.get_no(proximo_node_id)
        if not proximo_node:
            return self._resposta_erro("Próximo nó não encontrado.")

        proximas_opcoes = proximo_node["data"].get("options", [])
        fim_fluxo = len(proximas_opcoes) == 0 and not any(
            e["source"] == proximo_node_id for e in self.edges
        )

        return {
            "encontrou": True,
            "proximo_node_id": proximo_node_id,
            "mensagem": proximo_node["data"].get("label", ""),
            "opcoes": proximas_opcoes,
            "delay": proximo_node["data"].get("delay", 2),
            "fim_fluxo": fim_fluxo,
        }

    def montar_mensagem_com_opcoes(self, node: dict) -> str:
        """Monta a mensagem do bot com as opções formatadas."""
        label = node["data"].get("label", "")
        opcoes = node["data"].get("options", [])
        if not opcoes:
            return label
        opcoes_texto = "\n".join([f"{i+1} - {opt.split('-', 1)[-1].strip() if ' - ' in opt else opt}" for i, opt in enumerate(opcoes)])
        return f"{label}\n\n{opcoes_texto}"

    def _resposta_erro(self, msg: str) -> dict:
        return {"encontrou": False, "proximo_node_id": None, "mensagem": msg, "opcoes": [], "delay": 0, "fim_fluxo": True}