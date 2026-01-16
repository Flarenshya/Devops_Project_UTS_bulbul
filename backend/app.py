from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os
import logging
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from prometheus_flask_exporter import PrometheusMetrics

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
# Enable CORS
CORS(app)
# Initialize Prometheus Metrics
metrics = PrometheusMetrics(app)
# Ensure static info is also exported
metrics.info('app_info', 'Application info', version='1.0.0')

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'}), 200

MODEL_FILE = os.getenv("MODEL_FILE", "/data/model.pkl")

def train_model():
    logging.info("Starting model training...")
    try:
        df = pd.read_excel("dataset.xlsx")
        df = df.drop(columns=['NO', 'NAMA RUMAH'], errors='ignore')
        df = df.dropna()
        df[['HARGA','LB','LT','KT','KM','GRS']] = df[['HARGA','LB','LT','KT','KM','GRS']].astype(float)

        # Feature engineering
        df['LB_LT'] = df['LB'] / df['LT']
        df['TOTAL_KAMAR'] = df['KT'] + df['KM']
        df['LB_KT'] = df['LB'] * df['KT']

        X = df[['LB','LT','KT','KM','GRS','LB_LT','TOTAL_KAMAR','LB_KT']]
        y = np.log(df['HARGA'])

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        param_dist = {
            'n_estimators': [100, 200, 300, 500],
            'max_depth': [None, 10, 20, 30, 40],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4],
            'max_features': ['sqrt', 'log2', None] 
        }

        rf = RandomForestRegressor(random_state=42)
        rf_random = RandomizedSearchCV(
            rf, param_distributions=param_dist, n_iter=20, cv=5, scoring='r2',
            random_state=42, n_jobs=-1
        )
        rf_random.fit(X_train, y_train)

        best_model = rf_random.best_estimator_
        joblib.dump(best_model, MODEL_FILE)
        logging.info(f"Model trained and saved to {MODEL_FILE}")
        return best_model
    except Exception as e:
        logging.error(f"Error during training: {e}")
        raise

try:
    model = joblib.load(MODEL_FILE)
    logging.info("Model loaded from file.")
except Exception as e:
    logging.warning(f"Failed to load model: {e}. Retraining...")
    model = train_model()

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        logging.info(f"Received prediction request: {data}")

        LB = float(data.get('LB', 0))
        LT = float(data.get('LT', 0))
        KT = float(data.get('KT', 0))
        KM = float(data.get('KM', 0))
        GRS = float(data.get('GRS', 0))

        LB_LT = LB / LT if LT != 0 else 0
        TOTAL_KAMAR = KT + KM
        LB_KT = LB * KT

        features = np.array([[LB, LT, KT, KM, GRS, LB_LT, TOTAL_KAMAR, LB_KT]])
        prediction_log = model.predict(features)[0]
        prediction = np.exp(prediction_log)

        logging.info(f"Prediction result: {prediction}")
        return jsonify({'predicted_price': round(float(prediction), 0)})
    except Exception as e:
        logging.error(f"Error during prediction: {e}")
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)

