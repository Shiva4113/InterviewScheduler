import os
from dotenv import load_dotenv

load_dotenv()

JINA_EMBEDDINGS_API_KEY = os.getenv('JINA_EMBEDDINGS_API_KEY')
GROQ_API_KEY = os.getenv('GROQ_API_KEY')