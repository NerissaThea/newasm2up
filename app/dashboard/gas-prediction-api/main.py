from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from datetime import datetime
import requests
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import logging
from redis import asyncio as aioredis
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
import httpx
from fastapi_cache.decorator import cache
from sklearn.ensemble import RandomForestRegressor
import joblib
import pandas as pd



load_dotenv()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GasPredictor:
    def __init__(self):
        self.historical_data = []
        self.window_size = 48  # Giữ lại 48 giờ dữ liệu gần nhất
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.is_model_trained = False
        self.feature_columns = ['price', 'hour', 'day_of_week']
        self.peak_hours = {
            'weekday': [(8,10), (16,18)],  # Giờ cao điểm trong tuần
            'weekend': [(10,12), (14,16)]   # Giờ cao điểm cuối tuần
        }
    
    def add_historical_data(self, start_date, end_date):
        """
        Fetch historical gas price data from the Etherscan API and add it to the self.historical_data list.

        Parameters:
        start_date (datetime): The start date for fetching historical data.
        end_date (datetime): The end date for fetching historical data.
        """
        load_dotenv()
        etherscan_api_key = os.getenv("ETHERSCAN_API_KEY")
        if not etherscan_api_key:
            raise ValueError("ETHERSCAN_API_KEY not found in environment variables")

        api_url = "https://api.etherscan.io/api"

        while start_date <= end_date:
            try:
                response = requests.get(api_url, params={
                    "module": "gastracker",
                    "action": "gasPriceHistory",
                    "startdate": start_date.strftime("%Y-%m-%d"),
                    "enddate": start_date.strftime("%Y-%m-%d"),
                    "apikey": etherscan_api_key
                })
                response.raise_for_status()
                data = response.json()

                if data.get("status") == "1" and data.get("message") == "OK":
                    for entry in data["result"]:
                        timestamp = datetime.fromtimestamp(int(entry["timestamp"]))
                        self.historical_data.append({
                            "timestamp": timestamp,
                            "price": float(entry["gasPrice"]),
                            "hour": timestamp.hour,
                            "day_of_week": timestamp.weekday()
                        })

                start_date += timedelta(days=1)
            except requests.exceptions.RequestException as e:
                print(f"Error fetching data for {start_date}: {e}")
                start_date += timedelta(days=1)
        
    def add_price(self, price):
        current_time = datetime.now()
        self.historical_data.append({
            'timestamp': current_time,
            'price': float(price),
            'hour': current_time.hour,
            'day_of_week': current_time.weekday()
        })

        if len(self.historical_data) > self.window_size:
            self.historical_data.pop(0)

            
    def calculate_moving_average(self):
        if len(self.historical_data) < self.window_size:
            return None
        recent_prices = [d['price'] for d in self.historical_data[-self.window_size:]]
        return sum(recent_prices) / len(recent_prices)
    
    def calculate_volatility(self):
        if len(self.historical_data) < self.window_size:
            return 0.02  # Giảm độ biến động mặc định
        recent_prices = [d['price'] for d in self.historical_data[-self.window_size:]]
        return min(np.std(recent_prices) / np.mean(recent_prices), 0.1)  # Giới hạn độ biến động
        
    def calculate_network_congestion(self):
        # Tính toán độ tắc nghẽn mạng dựa trên lịch sử gần đây
        if len(self.historical_data) < 2:
            return 1.0
        recent_prices = [d['price'] for d in self.historical_data[-5:]]
        volatility = np.std(recent_prices) / np.mean(recent_prices)
        return min(1 + volatility, 1.3)
        
    def is_peak_hour(self, hour):
        is_weekend = datetime.now().weekday() >= 5
        ranges = self.peak_hours['weekend'] if is_weekend else self.peak_hours['weekday']
        return any(start <= hour <= end for start, end in ranges)
        
    def predict_next_hours(self, current_price, hours=6):
        predictions = []
        current_time = datetime.now()

        for i in range(hours):
            future_time = current_time + pd.Timedelta(hours=i)
            hour = future_time.hour
            day_of_week = future_time.weekday()

            predicted_price = self.predict(current_price, hour, day_of_week)
            rounded_price = round(predicted_price,2)
            predictions.append({
                'timestamp': int(future_time.timestamp() * 1000),
                'predictedFee': rounded_price,
                'confidence': self.calculate_confidence(hour, predicted_price - current_price)
            })

        return predictions

    def calculate_confidence(self, hour, change):
         # Calculate confidence based on time of day and price change
        base_confidence = 0.8
        time_penalty = 0.1 if self.is_peak_hour(hour) else 0
        change_penalty = abs(change) * 0.5
        return max(0.3, min(0.9, base_confidence - time_penalty - change_penalty))

    def validate_prediction(self, predicted_price, current_price):
        max_allowed_diff = max(1, current_price * 0.05)  # Cho phép sai số tối đa 5% hoặc 1 Gwei
        if abs(predicted_price - current_price) > max_allowed_diff:
            return current_price + (1 if predicted_price > current_price else -1)
        return predicted_price

    def prepare_data(self):
        if not self.historical_data:
            return None, None

        df = pd.DataFrame(self.historical_data)

        # Ensure data types are correct
        df['price'] = df['price'].astype(float)
        df['hour'] = df['hour'].astype(int)
        df['day_of_week'] = df['day_of_week'].astype(int)

        X = df[self.feature_columns].copy()
        y = df['price']

        return X, y
    
    def train_model(self):
        X, y = self.prepare_data()
        if X is None or len(X) < 2:
            logger.warning("Not enough data to train the model")
            return

        try:
            self.model.fit(X, y)
            self.is_model_trained = True
            logger.info("Model trained successfully with data shape: %s", X.shape)
        except Exception as e:
            logger.error("Error training model: %s", str(e))
            self.is_model_trained = False

    def load_model(self):
        self.model = joblib.load('gas_price_model.pkl')
        self.is_model_trained = True

    def predict(self, current_price, hour, day_of_week):
        if not self.is_model_trained:
            return current_price

        try:
            input_features = pd.DataFrame([[current_price, hour, day_of_week]], 
                                         columns=self.feature_columns)
            prediction = self.model.predict(input_features)[0]

            # Limit the prediction to a reasonable range
            max_change = current_price * 0.2
            prediction = max(current_price - max_change,
                            min(current_price + max_change, prediction))

            return float(prediction)
        except Exception as e:
            logger.error("Prediction error: %s", str(e))
            return current_price


predictor = GasPredictor()

async def fetch_current_gas_price():
    try:
        API_KEY = os.getenv('ETHERSCAN_API_KEY')
        if not API_KEY:
            logger.error("ETHERSCAN_API_KEY not found in environment variables")
            return 50
            
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey={API_KEY}"
            )
            data = response.json()
            
            if data.get("status") == "1" and data.get("message") == "OK":
                gas_price = float(data["result"]["SafeGasPrice"])  # Giữ nguyên giá trị thập phân
                logger.info(f"Fetched gas price: {gas_price}")
                return gas_price  # Trả về giá gas dưới dạng float
            else:
                logger.error(f"Etherscan API error: {data}")
                return 50
                
    except Exception as e:
        logger.error(f"Error fetching gas price: {str(e)}")
        return 50

@app.get("dashboard/api/predictions")
@cache(expire=60)
async def get_predictions():
    try:
        current_gas = await fetch_current_gas_price()
        logger.info(f"Current gas price fetched: {current_gas}")
        predictor.add_price(current_gas)
        predictor.train_model()  # Huấn luyện mô hình với dữ liệu mới
        predictions = predictor.predict_next_hours(current_gas)
        
        trend_analysis = {
            'direction': 'up' if predictions[-1]['predictedFee'] > current_gas else 'down',
            'percentage': abs(predictions[-1]['predictedFee'] - current_gas) / current_gas * 100,
            'volatility': predictor.calculate_volatility()
        }
        
        return {
            "predictions": predictions,
            "currentGas": current_gas,
            "bestTimeSlot": min(predictions, key=lambda x: x['predictedFee']),
            "trend": trend_analysis,
            "timestamp": int(datetime.now().timestamp() * 1000)
        }
    except Exception as e:
        logger.error(f"Error in get_predictions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/test")
async def test():
    return {"status": "ok", "message": "API is working"}

@app.on_event("startup")
async def startup():
    try:
        redis = aioredis.from_url(
            "redis://localhost:6379",
            encoding="utf8",
            decode_responses=True,
            socket_timeout=5,
            retry_on_timeout=True
        )
        await redis.ping()
        FastAPICache.init(RedisBackend(redis), prefix="gas-cache")
        logger.info("Successfully connected to Redis")
        predictor.load_model()  # Tải mô hình nếu đã được lưu
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {str(e)}")
        from fastapi_cache.backends.inmemory import InMemoryBackend
        FastAPICache.init(InMemoryBackend(), prefix="gas-cache")
        logger.info("Fallback to in-memory cache")

@app.get("/predict")
@cache(expire=60)
async def predict_gas():
    try:
        current_gas = await fetch_current_gas_price()
        predictor.add_price(current_gas)
        predictions = predictor.predict_next_hours(current_gas)
        
        trend_analysis = {
            'direction': 'up' if predictions[-1]['predictedFee'] > current_gas else 'down',
            'percentage': abs(predictions[-1]['predictedFee'] - current_gas) / current_gas * 100,
            'volatility': predictor.calculate_volatility()
        }
        
        return {
            "predictions": predictions,
            "currentGas": current_gas,
            "bestTimeSlot": min(predictions, key=lambda x: x['predictedFee']),
            "trend": trend_analysis,
            "timestamp": int(datetime.now().timestamp() * 1000)
        }
    except Exception as e:
        logger.error(f"Error in predict_gas: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))