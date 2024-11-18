import requests
import json
from datetime import datetime, timezone

def decode_method(input_data):
    if input_data == '0x':
        return 'Transfer'
    else:
        method_id = input_data[:10]
        method_map = {
            '0xa9059cbb': 'Transfer',
            '0x095ea7b3': 'Approve',
            '0x23b872dd': 'TransferFrom',
            '0x2e1a7d4d': 'Burn',
            '0x40c10f19': 'Mint',
            '0xf305d719': 'Withdraw',
            '0x9ebea88c': 'Propose Block',
            '0xd0e30db0': 'Deposit ETH',
        }
        return method_map.get(method_id, 'Unknown Method')

def get_transactions(address, api_key):
    url = f'https://api.etherscan.io/api?module=account&action=txlist&address={address}&startblock=0&endblock=99999999&sort=asc&apikey={api_key}'
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        if data['status'] == '1':
            return data['result']
        else:
            return []
    else:
        return []

def create_transaction_data(transactions):
    tx_data = []
    
    for tx in transactions:
        txn_fee = int(tx['gasUsed']) * int(tx['gasPrice']) / 10**18
        
        current_time = datetime.now(timezone.utc)
        txn_age = current_time - datetime.fromtimestamp(int(tx['timeStamp']), timezone.utc)
        
        tx_data.append({
            'hash': tx['hash'],
            'method': decode_method(tx['input']),
            'block': tx['blockNumber'],
            'age': str(txn_age).split('.')[0] + " ago",
            'from': tx['from'],
            'to': tx['to'],
            'amount': f"{int(tx['value']) / 10**18:.8f} ETH",
            'fee': f"{txn_fee:.8f}"
        })

    return sorted(tx_data, key=lambda x: x['method'])

def get_etherscan_data(address, api_key):
    transactions = get_transactions(address, api_key)
    if transactions:
        return create_transaction_data(transactions)
    return []

if __name__ == "__main__":
    address = "0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae"
    api_key = "RQ1E2Y5VTM4EKCNZTDHD58UCIXMPD34N1J"
    print(json.dumps(get_etherscan_data(address, api_key)))