class GameState:
    def __init__(self):
        self.aliens_designed = False
        self.alien_designs = []
    
    def set_aliens(self, aliens):
        self.alien_designs = aliens
        self.aliens_designed = True 