from flask import Flask, render_template, request, jsonify, redirect, url_for
from game_state import GameState
import os

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

@app.route('/get_aliens')
def get_aliens():
    if not game_state.aliens_designed:
        return jsonify({'error': 'Aliens not designed yet'}), 400
    return jsonify({'aliens': game_state.alien_designs})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port) 