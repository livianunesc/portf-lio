"""Servidor local do portfólio, sem dependências externas."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os

if __name__ == '__main__':
    os.chdir(Path(__file__).parent)
    port = int(os.environ.get('PORT', '8000'))
    print(f'Portfólio disponível na porta {port}', flush=True)
    ThreadingHTTPServer(('0.0.0.0', port), SimpleHTTPRequestHandler).serve_forever()
