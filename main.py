from llama_index.llms.groq import Groq
from dotenv import load_dotenv
from llama_index.core import VectorStoreIndex, Document
from llama_parse import LlamaParse
from llama_index.core import SimpleDirectoryReader
import os
from llama_index.embeddings.jinaai import JinaEmbedding
from llama_index.core.node_parser import SimpleNodeParser
from llama_index.core import PromptTemplate

load_dotenv()

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
JINA_EMBEDDINGS_API_KEY = os.getenv('JINA_EMBEDDINGS_API_KEY')


parser = LlamaParse(result_type='markdown')


llm = Groq(model='llama3-70b-8192', api_key=GROQ_API_KEY)


embed_model = JinaEmbedding(api_key=JINA_EMBEDDINGS_API_KEY)


file_extractor = {".pdf": parser}

documents = SimpleDirectoryReader(input_files=['samples/yuans-resume-template.pdf'], file_extractor=file_extractor).load_data()

node_parser = SimpleNodeParser.from_defaults()
nodes = node_parser.get_nodes_from_documents(documents)

index = VectorStoreIndex(nodes, embed_model=embed_model)

query_engine = index.as_query_engine(llm=llm)

custom_prompt = PromptTemplate(
    "Based on the given context about a resume, please extract and provide the following information:\n"
    "1. Full Name\n"
    "2. Email Address\n"
    "3. Phone Number\n\n"
    "If any of this information is not available in the context, please indicate so.\n\n"
    "Context: {context_str}\n\n"
    "Human: Extract the requested information.\n"
    "Assistant: Certainly! I'll extract the requested information from the resume context provided:\n\n"
)

query_engine.update_prompts({"text_qa_template": custom_prompt})

response = query_engine.query("Extract the full name, email address, and phone number from the resume. While extracting the full name, please dont take their qualification into account.")
print(response)