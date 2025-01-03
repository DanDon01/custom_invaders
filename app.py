from flask import Flask, render_template, request, jsonify
from game_state import GameState

app = Flask(__name__)
game_state = GameState()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/designer')
def designer():
    return render_template('designer.html')

@app.route('/game')
def game():
    if not game_state.aliens_designed:
        return redirect(url_for('designer'))
    return render_template('game.html')

@app.route('/save_aliens', methods=['POST'])
def save_aliens():
    aliens_data = request.json.get('aliens', [])
    game_state.set_aliens(aliens_data)
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True) 