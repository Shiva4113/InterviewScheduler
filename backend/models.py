from config import JINA_EMBEDDINGS_API_KEY,CEREBRAS_API_KEY
from llama_index.llms.groq import Groq
from llama_index.embeddings.jinaai import JinaEmbedding
from llama_index.llms.cerebras import Cerebras

def get_embed_model() -> JinaEmbedding:
    embed_model : JinaEmbedding = JinaEmbedding(api_key=JINA_EMBEDDINGS_API_KEY)
    return embed_model

def get_llm() -> Cerebras:
    llm : Cerebras = Cerebras(model='llama3.1-70b',api_key=CEREBRAS_API_KEY)
    return llm