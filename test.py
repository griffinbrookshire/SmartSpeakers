import requests

url1 = 'https://httpbin.org/anything'
url2 = 'http://0.0.0.0:5000/new_user'
data = {
    'id': 'sample_id', 
    'priority': 0,
}
#print(data['songs'])
r = requests.post(url2,  json=data)
print(r.text)

#url = 'http://0.0.0.0:5000/get_song'
#r = requests.get(url)
#print(r.text)

url3 = 'http://0.0.0.0:5000/current_queue'
r = requests.get(url3)
print((r.json().get('songs')))

#url4 = 'http://0.0.0.0:5000/update_song'
#data1 = {
#    'artist': 'Sample Artist', 
#    'title': '#Sample Title'
#}
#r = requests.post(url4, json = data1)

#id = 'spotify:track:27NovPIUIRrOZoCHxABJwK'
#sp = Song(id)
#a = Multiset([sp])
#print(a)

url5 = 'http://0.0.0.0:5000/current_queue'
data = {
    'user_id': 'sample_id', 
    'id': 'spotify:track:6r9xnueU24r4eoG3HXC87E',
}
r = requests.post(url5, json=data)

r = requests.get(url3)
print(len(r.json().get('songs')))