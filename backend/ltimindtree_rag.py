import fitz  # PyMuPDF
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()


# ✅ Initialize OpenAI client with environment variable
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ✅ Correct PDF path (adjust if needed)
PDF_PATH = "backend/data/LTIMindtree Annual Report.pdf"

# ✅ Extract all text chunks from PDF
def extract_text_from_pdf(relative_path: str):
    base_dir = os.path.dirname(__file__)
    abs_path = os.path.join(base_dir, "..", relative_path)  # go one level up
    abs_path = os.path.abspath(abs_path)  # clean it up

    print(f"📄 Resolved PDF path: {abs_path}")  # Debug print

    with fitz.open(abs_path) as doc:
        text_chunks = [page.get_text() for page in doc]
    return text_chunks

# ✅ Use the updated OpenAI Embedding API
def get_embedding(text):
    response = client.embeddings.create(
        input=text,
        model="text-embedding-ada-002"
    )
    return response.data[0].embedding

# ✅ Safely embed all chunks
def embed_chunks(chunks):
    embeddings = []
    for chunk in chunks:
        try:
            emb = get_embedding(chunk[:2000])  # truncate to avoid token limits
            embeddings.append(emb)
        except Exception as e:
            print(f"❌ Failed to embed chunk: {e}")
            embeddings.append([0] * 1536)
    return embeddings

# ✅ Main function exposed to Flask backend
def answer_question(query):
    print("📄 Loading and embedding PDF content...")

    chunks = extract_text_from_pdf(PDF_PATH)
    chunk_embeddings = embed_chunks(chunks)

    print("❓ Embedding user query...")
    query_embedding = get_embedding(query)

    print("🔎 Calculating similarity...")
    similarities = cosine_similarity([query_embedding], chunk_embeddings)[0]
    best_index = int(np.argmax(similarities))
    best_chunk = chunks[best_index]

    print("📤 Returning best-matched chunk via GPT...")

    # ✅ Ask ChatGPT with the best chunk
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful financial analyst assistant."},
            {"role": "user", "content": f"Given this content from an annual report:\n\n{best_chunk}\n\nAnswer this question:\n{query}"}
        ],
        temperature=0.3,
        max_tokens=512
    )

    return response.choices[0].message.content
