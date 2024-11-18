import requests
import pandas as pd
from datetime import datetime

# Etherscan API key
API_KEY = 'RQ1E2Y5VTM4EKCNZTDHD58UCIXMPD34N1J'

# Function to get transactions for a specific Ethereum address
def get_transactions(address, start_block=0, end_block=99999999):
    url = 'https://api.etherscan.io/api'
    params = {
        'module': 'account',
        'action': 'txlist',  # To get normal transactions
        'address': address,
        'startblock': start_block,
        'endblock': end_block,
        'sort': 'asc',  # Sort by ascending (use 'desc' for descending)
        'apikey': API_KEY
    }
    
    # Send GET request to Etherscan API
    response = requests.get(url, params=params)
    
    # Parse the response JSON
    data = response.json()
    
    if data['status'] == '1':  # Check if the response is successful
        return data['result']
    else:
        return None

# Function to create a table using pandas
def create_transaction_table(transactions):
    # Extract relevant fields from the transactions
    tx_data = []
    for tx in transactions:
        # Calculate transaction fee: Gas Used * Gas Price (in Wei)
        txn_fee = int(tx['gasUsed']) * int(tx['gasPrice']) / 10**18  # Convert to ETH
        
        # Calculate the transaction age from the current timestamp
        current_time = datetime.now()
        txn_age = current_time - datetime.utcfromtimestamp(int(tx['timeStamp']))
        
        tx_data.append({
            'Transaction Hash': tx['hash'],
            'Method': tx['input'][:10] if tx['input'] != '0x' else 'Transfer',  # Get method ID (first 10 chars of input) or "Transfer"
            'Block': tx['blockNumber'],
            'Age': txn_age,
            'From': tx['from'],
            'To': tx['to'],
            'Amount (ETH)': int(tx['value']) / 10**18,  # Convert Wei to ETH
            'Txn Fee (ETH)': txn_fee
        })
    
    # Create a DataFrame
    df = pd.DataFrame(tx_data)
    
    return df

# Example usage
if __name__ == '__main__':
    eth_address = '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe'  # Replace with your Ethereum address
    transactions = get_transactions(eth_address)
    
    if transactions:
        transaction_table = create_transaction_table(transactions)
        print(transaction_table)
    else:
        print("No transactions found or an error occurred.")
