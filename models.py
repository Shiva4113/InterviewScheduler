from config import JINA_EMBEDDINGS_API_KEY,GROQ_API_KEY
from llama_index.llms.groq import Groq
from llama_index.embeddings.jinaai import JinaEmbedding

def get_embed_model() -> JinaEmbedding:
    embed_model : JinaEmbedding = JinaEmbedding(api_key=JINA_EMBEDDINGS_API_KEY)
    return embed_model

def get_llm() -> Groq:
    llm : Groq = Groq(model='llama3-70b-8192',api_key=GROQ_API_KEY)
    return llm