from fastapi import FastAPI, HTTPException, File, UploadFile
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware

import tensorflow as tf
import numpy as np
from PIL import Image
import io

app = FastAPI()

# Enable CORS for React Native App communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# 1. AI Model Setup 

try:
    model = tf.keras.models.load_model("best_model.keras")
    print("✅ AI Model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")


class_names = ['akiec', 'bcc', 'bkl', 'mel', 'nv', 'vasc']


# 2. MongoDB Connection Setup

MONGO_DETAILS = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.skin_app_database # Database Name
user_collection = database.get_collection("users") # Collection for users
prediction_collection = database.get_collection("predictions") # Collection for AI records


# 3. Data Models for validation

class SignupRequest(BaseModel):
    full_name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str


# 4. SIGNUP & LOGIN ENDPOINTS

@app.post("/auth/signup")
async def signup(user: SignupRequest):
    existing_user = await user_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user.dict()
    user_dict["role"] = "user" # Default role
    
    await user_collection.insert_one(user_dict)
    return {"message": "User created successfully in MongoDB"}

@app.post("/auth/login")
async def login(credentials: LoginRequest):
    # Admin Check 
    if credentials.email == "admin@gmail.com" and credentials.password == "admin1234":
        return {"role": "admin"} 
        
    user = await user_collection.find_one({
        "email": credentials.email, 
        "password": credentials.password
    })
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {"role": user.get("role", "user")}


# 5. PREDICT ENDPOINT 

@app.post("/predict")
async def predict_skin_disease(file: UploadFile = File(...)):
    try:
        
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        
        
        image = image.resize((224, 224))
        img_array = tf.keras.preprocessing.image.img_to_array(image)
        img_array = np.expand_dims(img_array, axis=0)

        img_array = img_array / 255.0
        
        predictions = model.predict(img_array)
        
        
        predicted_class_index = np.argmax(predictions[0])
        predicted_class = class_names[predicted_class_index]
        confidence = round(100 * np.max(predictions[0]), 2)


        return {
            "success": True,
            "prediction": predicted_class,
            "confidence": f"{confidence}%",
            "all_scores": {class_names[i]: float(predictions[0][i]) for i in range(len(class_names))}
        }

    except Exception as e:
        return {"success": False, "error": str(e)}