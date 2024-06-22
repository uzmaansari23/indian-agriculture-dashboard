import pandas as pd
import json

# Load the dataset from JSON file
with open('India_Agro_Dataset.json') as f:
    data = json.load(f)

df = pd.DataFrame(data)

# Replace missing values with 0
df.fillna(0, inplace=True)

# Convert relevant columns to numeric
df["Crop Production (UOM:t(Tonnes))"] = pd.to_numeric(df["Crop Production (UOM:t(Tonnes))"], errors='coerce').fillna(0)
df["Yield Of Crops (UOM:Kg/Ha(KilogramperHectare))"] = pd.to_numeric(df["Yield Of Crops (UOM:Kg/Ha(KilogramperHectare))"], errors='coerce').fillna(0)
df["Area Under Cultivation (UOM:Ha(Hectares))"] = pd.to_numeric(df["Area Under Cultivation (UOM:Ha(Hectares))"], errors='coerce').fillna(0)

# Extract year from the 'Year' column
df['Year'] = df['Year'].str.extract(r'(\d{4})').astype(int)

# Save the cleaned DataFrame to CSV
df.to_csv('India_Agro_Dataset_Cleaned.csv', index=False)

print("Data has been cleaned and saved to India_Agro_Dataset_Cleaned.csv")
