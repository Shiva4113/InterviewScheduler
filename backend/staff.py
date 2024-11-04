import os
from llama_parse import LlamaParse
from llama_index.core import SimpleDirectoryReader
from config import CEREBRAS_API_KEY

parser = LlamaParse(result_type='markdown')

file_extractor = {'.pdf':parser}

output_doc = SimpleDirectoryReader(input_files=['./timetable.pdf'])
docs = output_doc.load_data()
md_text = ""
for doc in docs:
    md_text += doc.text

with open("output.md",'w',encoding='utf-8') as file_handle:
    file_handle.write(md_text)

print("MD file created successfully")