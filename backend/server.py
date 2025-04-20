from flask import Flask, request, jsonify
from flask_cors import CORS
from ltimindtree_rag import answer_question

app = Flask(__name__)
CORS(app)

@app.route("/ask", methods=["POST"])
def ask():
    try:
        data = request.json
        query = data.get("query")
        print("📥 Received question:", query)

        answer = answer_question(query)
        return jsonify({"answer": answer})

    except Exception as e:
        import traceback
        print("❌ Exception occurred:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=8000)
