import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(ROOT))

from Hub.main import app


class TestDashboardAPI(unittest.TestCase):
    def test_filtrar_dados_returns_chart_data_without_database(self):
        cliente = app.test_client()

        resposta = cliente.post('/api/filtrar', json={'periodo': 'Últimos 7 dias'})

        self.assertEqual(resposta.status_code, 200)
        dados = resposta.get_json()
        self.assertIn('grafico', dados)
        self.assertIn('labels', dados)
        self.assertEqual(len(dados['grafico']), len(dados['labels']))
        self.assertTrue(dados['grafico'])


if __name__ == '__main__':
    unittest.main()
