# app/bot/bot_engine.py
import json

TIPO_TEXTO  = "texto"
TIPO_IMAGEM = "imagem"
TIPO_IA     = "ia"


class BotEngine:
    """
    Motor do bot — lê o fluxo salvo no banco e processa respostas.
    Suporta: botNode (texto + opções), imageNode (imagem + legenda), iaNode (IA).
    """

    def __init__(self, fluxo_json: str):
        dados = json.loads(fluxo_json) if isinstance(fluxo_json, str) else fluxo_json
        self.nodes = {node["id"]: node for node in dados.get("nodes", [])}
        self.edges = dados.get("edges", [])

    # ── Helpers ───────────────────────────────────────────────────────────────

    def get_no_inicial(self) -> dict | None:
        nos_destino = {edge["target"] for edge in self.edges}
        for node_id, node in self.nodes.items():
            if node_id not in nos_destino:
                return node
        return self.nodes.get("1")

    def get_no(self, node_id: str) -> dict | None:
        return self.nodes.get(node_id)

    def _tipo_no(self, node: dict) -> str:
        t = node.get("type", "botNode")
        if t == "imageNode":
            return TIPO_IMAGEM
        if t == "iaNode":
            return TIPO_IA
        return TIPO_TEXTO

    def _image_url(self, node: dict) -> str:
        return node["data"].get("imageUrl") or node["data"].get("image_url") or ""

    # ── Monta resposta padronizada de um nó ──────────────────────────────────

    def montar_resposta_no(self, node: dict) -> dict:
        """
        Retorna dict padronizado com tudo que o frontend precisa.
        Campos: tipo_node, mensagem, image_url, opcoes, delay
        """
        tipo   = self._tipo_no(node)
        label  = node["data"].get("label", "")
        opcoes = node["data"].get("options", [])
        delay  = node["data"].get("delay", 2)

        return {
            "tipo_node": tipo,
            "mensagem":  label,
            "image_url": self._image_url(node) if tipo == TIPO_IMAGEM else "",
            "opcoes":    opcoes,
            "delay":     delay,
        }

    def montar_mensagem_com_opcoes(self, node: dict) -> str:
        """Versão texto puro — usada pelo webhook WhatsApp real (Evolution API)."""
        label  = node["data"].get("label", "")
        opcoes = node["data"].get("options", [])
        if not opcoes:
            return label
        opcoes_texto = "\n".join([
            f"{i+1} - {opt.split('-', 1)[-1].strip() if ' - ' in opt else opt}"
            for i, opt in enumerate(opcoes)
        ])
        return f"{label}\n\n{opcoes_texto}"

    # ── Processa resposta e avança o fluxo ───────────────────────────────────

    def processar_resposta(self, node_id_atual: str, mensagem_usuario: str) -> dict:
        node_atual = self.get_no(node_id_atual)
        if not node_atual:
            return self._resposta_erro("Nó não encontrado.")

        opcoes         = node_atual["data"].get("options", [])
        mensagem_lower = mensagem_usuario.strip().lower()

        handle_escolhido = None
        for i, opcao in enumerate(opcoes):
            numero = str(i + 1)

            # Aceita numero simples: "1", "2"...
            if mensagem_lower == numero:
                handle_escolhido = f"opt{i}"
                break

            # Aceita texto completo da opcao
            if mensagem_lower == opcao.strip().lower():
                handle_escolhido = f"opt{i}"
                break

            # Aceita texto apos o " - " (ex: usuario digita "Desejo falar com suporte.")
            if " - " in opcao:
                texto_apos = opcao.split(" - ", 1)[1].strip().lower()
                if mensagem_lower == texto_apos:
                    handle_escolhido = f"opt{i}"
                    break

        if handle_escolhido is None and len(opcoes) == 0:
            handle_escolhido = "default"

        proximo_node_id = None
        if handle_escolhido:
            for edge in self.edges:
                if edge["source"] == node_id_atual and edge.get("sourceHandle") == handle_escolhido:
                    proximo_node_id = edge["target"]
                    break

        if not proximo_node_id:
            for edge in self.edges:
                if edge["source"] == node_id_atual and edge.get("sourceHandle") in [None, "fallback", "default"]:
                    proximo_node_id = edge["target"]
                    break

        if not proximo_node_id:
            resposta_atual = self.montar_resposta_no(node_atual)
            return {
                "encontrou":       False,
                "proximo_node_id": node_id_atual,
                **resposta_atual,
                "fim_fluxo": False,
            }

        proximo_node = self.get_no(proximo_node_id)
        if not proximo_node:
            return self._resposta_erro("Próximo nó não encontrado.")

        resposta = self.montar_resposta_no(proximo_node)

        fim_fluxo = (
            len(resposta["opcoes"]) == 0
            and not any(e["source"] == proximo_node_id for e in self.edges)
        )

        return {
            "encontrou":       True,
            "proximo_node_id": proximo_node_id,
            **resposta,
            "fim_fluxo": fim_fluxo,
        }

    def _resposta_erro(self, msg: str) -> dict:
        return {
            "encontrou":       False,
            "proximo_node_id": None,
            "tipo_node":       TIPO_TEXTO,
            "mensagem":        msg,
            "image_url":       "",
            "opcoes":          [],
            "delay":           0,
            "fim_fluxo":       True,
        }