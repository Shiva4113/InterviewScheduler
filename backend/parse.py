from processing_utils import get_embed_model, get_llm, load_document, parse_nodes, create_index, create_query_engine

async def process_resume(file_path, llm, embed_model):
    try:
        documents = load_document([file_path])
        nodes = parse_nodes(documents)
        index = create_index(nodes, embed_model)
        query_engine = create_query_engine(index, llm)

        education = query_engine.query('''Give me only the user's education details.''')
        work = query_engine.query('''Give me only the user's work experience details.''')
        skills = query_engine.query('''Give me only the user's skill-set related details.''')
        publications = query_engine.query('''Give me only the user's publications details if any.''')
        response = [education.response,work.response,skills.response,publications.response]
        print(response)
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