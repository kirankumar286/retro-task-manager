import requests
import json

URL = 'http://localhost:8000/api/ai/classify/'

# We need a token first
auth_resp = requests.post('http://localhost:8000/api/auth/login/', json={'username': 'teste2e', 'password': 'Password123!'})
token = auth_resp.json()['access']
headers = {'Authorization': f'Bearer {token}'}

prompts = [
    'remind me to call mom tonight',
    'oh man I completely forgot to add buy milk and eggs to my list for this weekend',
    'urgently fix the production database bug by 2 PM',
    'read a book',
    'schedule a meeting with John at 3:30 PM on Thursday'
]

for p in prompts:
    print(f'\n--- Testing: {p} ---')
    res = requests.post(URL, json={'prompt': p}, headers=headers)
    if res.status_code == 201:
        data = res.json()
        print(json.dumps(data.get('task', {}), indent=2))
    else:
        print('FAILED:', res.text)
