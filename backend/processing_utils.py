from config import JINA_EMBEDDINGS_API_KEY, CEREBRAS_API_KEY
from llama_index.core import VectorStoreIndex
from llama_index.embeddings.jinaai import JinaEmbedding
from llama_index.llms.cerebras import Cerebras
from llama_index.core import SimpleDirectoryReader, PromptTemplate
from llama_index.core.node_parser import SimpleNodeParser
from llama_parse import LlamaParse

def get_embed_model() -> JinaEmbedding:
    embed_model: JinaEmbedding = JinaEmbedding(api_key=JINA_EMBEDDINGS_API_KEY)
    return embed_model

def get_llm() -> Cerebras:
    llm: Cerebras = Cerebras(model='llama3.1-70b', api_key=CEREBRAS_API_KEY)
    return llm

def get_parser() -> LlamaParse:
    parser = LlamaParse(result_type='markdown')
    return parser

def load_document(input_files) -> SimpleDirectoryReader:
    file_extractor = {'.pdf': get_parser()}
    document = SimpleDirectoryReader(input_files=input_files, file_extractor=file_extractor).load_data()
    return document

def parse_nodes(documents):
    node_parser = SimpleNodeParser.from_defaults()
    nodes = node_parser.get_nodes_from_documents(documents)
    return nodes

def create_index(nodes, embed_model):
    index = VectorStoreIndex(nodes, embed_model=embed_model)
    return index

def create_query_engine(index, llm):
    query_engine = index.as_query_engine(llm=llm)

    custom_prompt = PromptTemplate(
        "Based on the given context about a resume, please extract and provide the following information:\n"
        "1. Full Name\n"
        "2. Email Address\n"
        "3. Phone Number\n\n"
        "4. Years of Experience : N years M months\n"
        "5. Experience details\n"
        "6. Publications\n"
        "7. Education\n"
        "8. Skills\n"
        "9. Projects\n\n"
        "If any of this information is not available in the context, please indicate so.\n\n"
        "Context: {context_str}\n\n"
        "Human: Extract the requested information.\n"
        "Assistant: Certainly! I'll extract the requested information from the resume context provided:\n\n"
    )
    query_engine.update_prompts({"text_qa_template": custom_prompt})
    return query_engine
