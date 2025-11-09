import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import joblib

df = pd.read_excel("dataset.xlsx")

df = df.drop(columns=['NO', 'NAMA RUMAH'], errors='ignore')

df = df.dropna()

df[['HARGA','LB','LT','KT','KM','GRS']] = df[['HARGA','LB','LT','KT','KM','GRS']].astype(float)

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

joblib.dump(best_model, "model.pkl")

y_pred_log = best_model.predict(X_test)
y_pred = np.exp(y_pred_log)
y_test_orig = np.exp(y_test)

r2 = r2_score(y_test_orig, y_pred)
mae = mean_absolute_error(y_test_orig, y_pred)
rmse = np.sqrt(mean_squared_error(y_test_orig, y_pred))

print("=== Random Forest dengan Log-Transform & Tuning (Updated) ===")
print(f"Akurasi (R²): {r2*100:.2f}%")
print(f"MAE: {mae:,.0f}")
print(f"RMSE: {rmse:,.0f}")
