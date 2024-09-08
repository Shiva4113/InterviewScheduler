from dotenv import load_dotenv
load_dotenv()

from llama_parse import LlamaParse
from llama_index.core import SimpleDirectoryReader

parser = LlamaParse(
    result_type= 'markdown'
)

file_extractor = {".pdf":parser}
documents = SimpleDirectoryReader(input_files=['samples/yuans-resume-template.pdf'], file_extractor=file_extractor).load_data()
print(documents)