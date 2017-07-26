#-*- coding:utf8 -*-

import threading
import hashlib
import socket
import base64

global clients
clients = {}

def SendMsg(msg, connection):
    if (len(msg) < 126):
        connection.send('%c%c%s' % (0x81, len(msg), msg))
    else:
        connection.send('%c%c%c%c%s' % (0x81, 126, (len(msg)>>8 & 0xFF), (len(msg) & 0xFF), msg))

#客户端处理线程
class websocket_thread(threading.Thread):
    def __init__(self, connection, username):
        super(websocket_thread, self).__init__()
        self.connection = connection
        self.username = username
    
    def run(self):
        print 'new websocket client joined!'
        data = self.connection.recv(1024)
        token = self.parse_token(data)
        self.connection.send('\
HTTP/1.1 101 WebSocket Protocol Hybi-10\r\n\
Upgrade: WebSocket\r\n\
Connection: Upgrade\r\n\
Sec-WebSocket-Accept: %s\r\n\r\n' % token)
        while True:
            try:
                data = self.connection.recv(1024)
            except socket.error, e:
                print "unexpected error: ", e
                break
            data = self.parse_data(data)
            print data
            if len(data) == 0:
                continue
            if ("Close" == data):
                message = '{"action":"Close"}'
                SendMsg(message, self.connection)
                self.connection.settimeout(1)
            if ("Connect" == data):
                message = '{"action":"Connect"}'
                SendMsg(message, self.connection)
            if ("View" == data):
                message = '{"action":"View","SN":[1,2],"typeId":[0,1],"id":[3,3],"owner":["a","9D784978-6B6D-4C67-9A5A-67BFB0968352"],"status":[0,0]}'
                SendMsg(message, self.connection)
            if ("Buy|" in data):
                message = '{"action":"Buy","status":0}'
                SendMsg(message, self.connection)
            if ("Sell|" in data):
                message = '{"action":"Sell"}'
                SendMsg(message, self.connection)
            if ("Get|" in data):
                message = '{"action":"Get","status":0}'
                SendMsg(message, self.connection)

    def parse_data(self, msg):
        v = ord(msg[1]) & 127
        if v == 127:
            p = 10
        elif v == 126:
            p = 4
        else:
            p = 2
        mask = msg[p:p+4]
        data = msg[p+4:]
        return ''.join([chr(ord(v) ^ ord(mask[k%4])) for k, v in enumerate(data)])
        
    def parse_token(self, msg):
        header, data = msg.split('\r\n\r\n', 1)
        for line in header.split('\r\n')[1:]:
            if "Sec-WebSocket-Key" in line:
                value1, value2 = line.split(': ', 1)
        key = value2 + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
        ser_key = hashlib.sha1(key).digest()
        return base64.b64encode(ser_key)

#服务端
class websocket_server(threading.Thread):
    def __init__(self, port):
        super(websocket_server, self).__init__()
        self.port = port

    def run(self):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sock.bind(('127.0.0.1', self.port))
        sock.listen(5)
        print 'websocket server started!'
        while True:
            connection, address = sock.accept()
            connection.settimeout(60)
            try:
                username = "ID" + str(address[1])
                thread = websocket_thread(connection, username)
                thread.start()
                clients[username] = connection
            except socket.timeout:
                print 'websocket connection timeout!'

if __name__ == '__main__':
    server = websocket_server(9000)
    server.start()
