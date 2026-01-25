"""
Gerenciador de Tokens - Leitura e Escrita de tokens de acesso.

Este módulo lida com a persistência dos tokens (access e refresh) para a API
do Mercado Livre, usando um arquivo JSON simples como armazenamento.
"""

import json
import os
from typing import Tuple, Optional, Dict

TOKEN_FILE = 'token_storage.json'

def read_tokens() -> Tuple[Optional[str], Optional[str]]:
    """
    Lê o access_token e refresh_token do arquivo de armazenamento.

    Returns:
        Uma tupla contendo (access_token, refresh_token).
        Retorna (None, None) se o arquivo não existir ou for inválido.
    """
    if not os.path.exists(TOKEN_FILE):
        return None, None
    
    try:
        with open(TOKEN_FILE, 'r') as f:
            data = json.load(f)
            return data.get('access_token'), data.get('refresh_token')
    except (IOError, json.JSONDecodeError):
        return None, None

def write_tokens(token_data: Dict[str, any]):
    """
    Escreve o novo access_token e refresh_token no arquivo de armazenamento.

    Args:
        token_data: Um dicionário contendo pelo menos 'access_token' e 'refresh_token'.
    """
    try:
        with open(TOKEN_FILE, 'w') as f:
            # Extrai apenas os campos necessários para evitar salvar dados extras
            filtered_data = {
                'access_token': token_data.get('access_token'),
                'refresh_token': token_data.get('refresh_token')
            }
            json.dump(filtered_data, f, indent=4)
    except IOError as e:
        print(f"[TokenManager] Erro ao escrever no arquivo de token: {e}")

