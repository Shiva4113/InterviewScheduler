from models import get_embed_model, get_llm
from process_document import load_document, parse_nodes
from create_index import create_index
from query_engine import create_query_engine

def process_resume(file_path, llm, embed_model):
    try:
        documents = load_document([file_path])
        nodes = parse_nodes(documents)
        index = create_index(nodes, embed_model)
        query_engine = create_query_engine(index, llm)

        response = query_engine.query('''Extract the full name, email address, and phone number from the resume.
                                        Also extract the years of experience, experience details, publications, education, projects with some detail, publications, projects and skills of the individual. 
                                        While extracting the full name, please don't take their qualification into account.''')
        return response
    except Exception as e:
        return f"Error processing {file_path}: {str(e)}"

def main():
    llm = get_llm()
    embed_model = get_embed_model()

    input_files = [
        '../samples/Resume_ShivaGolugula.pdf'
    ]

    for file in input_files:
        print(f"\nProcessing: {file}")
        print("-" * 50)
        response = process_resume(file, llm, embed_model)
        print(response)
        print("-" * 50)

if __name__ == '__main__':
    main()