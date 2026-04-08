import socket
try:
    s = socket.socket()
    s.settimeout(2)
    s.connect(('127.0.0.1', 3306))
    print('OK')
except Exception as e:
    print('ERR', type(e).__name__, e)
finally:
    s.close()
