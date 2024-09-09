from llama_index.core import VectorStoreIndex

def create_index(nodes,embed_model):
    index = VectorStoreIndex(nodes,embed_model=embed_model)
    return index