from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import os
import secrets

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)  # Generate a secure secret key

@app.route('/')
def home():
    # Clear any existing session data when returning to home
    session.clear()
    return render_template('index.html')

@app.route('/designer')
def designer():
    return render_template('designer.html')

@app.route('/game')
def game():
    if 'aliens' not in session:
        return redirect(url_for('designer'))
    return render_template('game.html')

@app.route('/save_aliens', methods=['POST'])
def save_aliens():
    aliens_data = request.json.get('aliens', [])
    session['aliens'] = aliens_data
    return jsonify({'success': True})

@app.route('/get_aliens')
def get_aliens():
    if 'aliens' not in session:
        return jsonify({'error': 'Aliens not designed yet'}), 400
    return jsonify({'aliens': session['aliens']})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port) 