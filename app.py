from flask import Flask, request, jsonify
import openai

app = Flask(__name__)

openai.api_key = 'sk-None-AMpXcNkc58iKCRFcImGyT3BlbkFJTlNASZIMcS6EALYGIDEL'

@app.route('/checklist', methods=['POST'])
def generate_checklist():
    data = request.get_json()
    flight_info = data.get('flight_info')

    prompt = f"Given the following flight information: {flight_info}, provide a checklist of travel documents needed for this flight."

    response = openai.Completion.create(
        engine="davinci-codex",
        prompt=prompt,
        max_tokens=150
    )

    checklist = response.choices[0].text.strip()

    return jsonify({'checklist': checklist})

if __name__ == '__main__':
    app.run(debug=True)