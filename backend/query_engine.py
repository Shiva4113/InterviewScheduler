from llama_index.core import PromptTemplate

def create_query_engine(index,llm):
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