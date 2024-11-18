from flask import Flask, request, jsonify
from flask_cors import CORS
from etherscan_to_neo4j import fetch_and_save_transactions
import time
import requests
import os
from dotenv import load_dotenv
from datetime import datetime


load_dotenv()  # Load environment variables from .env file

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

ETHERSCAN_API_KEY = os.getenv('ETHERSCAN_API_KEY')
ETHERSCAN_API_URL = os.getenv('ETHERSCAN_API_URL')
NEXT_PUBLIC_API_URL = os.getenv('NEXT_PUBLIC_API_URL')
NEO4J_URI = os.getenv('NEO4J_URI')
NEO4J_USERNAME = os.getenv('NEO4J_USERNAME')
NEO4J_PASSWORD = os.getenv('NEO4J_PASSWORD')
BSCSCAN_API_URL = 'https://api.bscscan.com/api'
BSCSCAN_API_KEY = os.getenv('BSCSCAN_API_KEY')

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    address = request.args.get('address')
    if not address:
        return jsonify({'success': False, 'message': 'Address parameter is missing'}), 400
    
    try:
        # Gọi hàm để lấy và lưu transactions
        transactions = fetch_and_save_transactions(address)
        
        # Format transactions theo cấu trúc mà frontend cần
        formatted_transactions = []
        for tx in transactions:
            if float(tx.get('amount', 0)) > 0:
                formatted_tx = {
                    'from': tx['from'],
                    'to': tx['to'],
                    'amount': float(tx['amount']),  # Chuyển sang float
                    'timestamp': int(tx['timeStamp']),  # Chuyển sang integer
                    'hash': tx.get('hash'),
                    'block': tx.get('blockNumber'),
                    'fee': tx.get('gasUsed', '0.000000')
                }
                formatted_transactions.append(formatted_tx)
        

        return jsonify({
            'success': True,
            'transactions': formatted_transactions
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
    


def fetch_json(url, params):
    response = requests.get(url, params=params)
    return response.json()

def get_transaction_list(address, api_url, api_key):
    params = {
        'module': 'account',
        'action': 'txlist',
        'address': address,
        'startblock': 0,
        'endblock': 99999999,
        'sort': 'asc',
        'apikey': api_key
    }
    return fetch_json(api_url, params)

def get_token_transactions(address, api_url, api_key):
    params = {
        'module': 'account',
        'action': 'tokentx',
        'address': address,
        'startblock': 0,
        'endblock': 99999999,
        'sort': 'asc',
        'apikey': api_key
    }
    return fetch_json(api_url, params)

def analyze_transactions(tx_list, address):
    total_sent = 0
    total_received = 0
    first_seen = None
    last_seen = None
    funded_by = set()

    for tx in tx_list.get('result', []):
        value = int(tx['value'])
        if tx['from'].lower() == address.lower():
            total_sent += value
        if tx['to'].lower() == address.lower():
            total_received += value
            funded_by.add(tx['from'])
        
        tx_timestamp = int(tx['timeStamp'])
        if first_seen is None or tx_timestamp < first_seen:
            first_seen = tx_timestamp
        if last_seen is None or tx_timestamp > last_seen:
            last_seen = tx_timestamp

    return {
        'totalSent': total_sent,
        'totalReceived': total_received,
        'firstSeen': datetime.fromtimestamp(first_seen).isoformat() if first_seen else 'Not available',
        'lastSeen': datetime.fromtimestamp(last_seen).isoformat() if last_seen else 'Not available',
        'fundedBy': list(funded_by)
    }

def get_token_holdings(token_tx_list, address):
    token_holdings = {}

    for tx in token_tx_list.get('result', []):
        token_address = tx['contractAddress']
        token_symbol = tx['tokenSymbol']
        token_amount = int(tx['value']) / (10 ** int(tx['tokenDecimal']))
        
        if token_address not in token_holdings:
            token_holdings[token_address] = {
                'token_symbol': token_symbol,
                'amount': 0
            }
        
        if tx['to'].lower() == address.lower():
            token_holdings[token_address]['amount'] += token_amount
        elif tx['from'].lower() == address.lower():
            token_holdings[token_address]['amount'] -= token_amount

    return [v for v in token_holdings.values() if v['amount'] > 0]

def get_multichain_info(address):
    eth_tx_list = get_transaction_list(address, ETHERSCAN_API_URL, ETHERSCAN_API_KEY)
    bsc_tx_list = get_transaction_list(address, BSCSCAN_API_URL, BSCSCAN_API_KEY)

    return {
        'ethereum': analyze_transactions(eth_tx_list, address),
        'binanceSmartChain': analyze_transactions(bsc_tx_list, address)
    }

@app.route('/api/address/<address>', methods=['GET'])
def get_address_info(address):
    if not address:
        return jsonify({'success': False, 'message': 'Address parameter is missing'}), 400

    try:
        # Fetch balance and ETH value
        balance_params = {
            'module': 'account',
            'action': 'balance',
            'address': address,
            'tag': 'latest',
            'apikey': ETHERSCAN_API_KEY
        }
        balance_data = fetch_json(ETHERSCAN_API_URL, balance_params)
        balance_wei = int(balance_data['result'])
        balance_eth = balance_wei / 1e18  # Convert wei to ETH

        # Fetch ETH price
        eth_price_params = {
            'module': 'stats',
            'action': 'ethprice',
            'apikey': ETHERSCAN_API_KEY
        }
        eth_price_data = fetch_json(ETHERSCAN_API_URL, eth_price_params)
        eth_price_usd = float(eth_price_data['result']['ethusd'])

        # Calculate total value in USD
        total_value_usd = balance_eth * eth_price_usd

        # Fetch gas price
        gas_params = {
            'module': 'gastracker',
            'action': 'gasoracle',
            'apikey': ETHERSCAN_API_KEY
        }
        gas_data = fetch_json(ETHERSCAN_API_URL, gas_params)

        # Fetch transactions for total sent and received
        tx_list_data = get_transaction_list(address, ETHERSCAN_API_URL, ETHERSCAN_API_KEY)
        address_info = analyze_transactions(tx_list_data, address)

        # Fetch token transactions
        token_list_data = get_token_transactions(address, ETHERSCAN_API_URL, ETHERSCAN_API_KEY)
        token_holdings = get_token_holdings(token_list_data, address)

        # Fetch private name tag (if available)
        name_tag_params = {
            'module': 'account',
            'action': 'addressinfo',
            'address': address,
            'apikey': ETHERSCAN_API_KEY
        }
        name_tag_data = fetch_json(ETHERSCAN_API_URL, name_tag_params)
        private_name_tag = name_tag_data.get('result', {}).get('privateNameTag', 'Not available')

        # Get multichain information
        multichain_info = get_multichain_info(address)

        # Prepare the response
        address_info = {
            'address': address,
            'gas': f"{gas_data['result']['SafeGasPrice']} Gwei",
            'balance': f"{balance_eth:.18f} ETH",
            'totalSent': f"{address_info['totalSent'] / 1e18:.18f} ETH",
            'totalReceived': f"{address_info['totalReceived'] / 1e18:.18f} ETH",
            'value': f"${total_value_usd:.2f}",
            'tokenHoldings': token_holdings,
            'privateNameTag': private_name_tag,
            'firstSeen': address_info['firstSeen'],
            'lastSeen': address_info['lastSeen'],
            'fundedBy': address_info['fundedBy'],
            'multichainInfo': multichain_info
        }

        return jsonify({
            'success': True,
            'data': address_info
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)