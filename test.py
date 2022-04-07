import requests

url1 = 'https://httpbin.org/anything'
url2 = 'http://0.0.0.0:5000/new_user'
data = {
    'id': 'sample_id', 
    'songs': ['spotify:track:27NovPIUIRrOZoCHxABJwK', 'spotify:track:6pmNoWKk0r6zfIjWneJRxR']
}
print(data['songs'])
r = requests.post(url2,  json=data)
print(r.text)

#url = 'http://0.0.0.0:5000/get_song'
#r = requests.get(url)
#print(r.text)