
from pymongo import MongoClient

class Conexion:
    
    def __init__(self):
        '''
        Constructor
        '''
    def conectar(self):
        client = MongoClient('mongodb://admin:12345@127.0.0.1:27017/')
        db = client.proyecto
        return db   