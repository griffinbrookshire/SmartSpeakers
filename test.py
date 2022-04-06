import requests

url = 'http://192.168.1.54:5000/new_user'
r = requests.post(url,  data={
    'id': 'sample_id', 
    'songs': [
        {'id': 'spotify:track:27NovPIUIRrOZoCHxABJwK'},
        {'id': 'spotify:track:6pmNoWKk0r6zfIjWneJRxR'}
        ]
    })
