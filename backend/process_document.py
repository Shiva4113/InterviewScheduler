from llama_parse import LlamaParse
from llama_index.core import SimpleDirectoryReader
from llama_index.core.node_parser import SimpleNodeParser

def get_parser() -> LlamaParse :
    parser = LlamaParse(result_type='markdown')
    return parser

def load_document(input_files) -> SimpleDirectoryReader:
    file_extractor = {'.pdf':get_parser()}
    document = SimpleDirectoryReader(input_files=input_files,file_extractor=file_extractor).load_data()
    return document

def parse_nodes(documents):
    node_parser = SimpleNodeParser.from_defaults()
    nodes = node_parser.get_nodes_from_documents(documents)
    return nodes