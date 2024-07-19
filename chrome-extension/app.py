from flask import Flask, request, jsonify
import openai


app = Flask(__name__)

openai.api_key = 'sk-None-AMpXcNkc58iKCRFcImGyT3BlbkFJTlNASZIMcS6EALYGIDEL'

@app.route('/checklist', methods=['POST'])
def generate_checklist():
    try:
        data = request.get_json()
        flight_info = data.get('flight_info')

        if not flight_info:
            return jsonify({'error': 'Flight information is required'}), 400

        prompt = f"Given the following flight information: {flight_info}, provide a checklist of travel documents needed for this flight."

        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=prompt,
            max_tokens=150
        )

        checklist = response.choices[0].text.strip()

        return jsonify({'checklist': checklist})

    except openai.error.OpenAIError as e:
        return jsonify({'error': 'OpenAI API error: ' + str(e)}), 500
    except Exception as e:
        return jsonify({'error': 'Internal server error: ' + str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

