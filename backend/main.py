from fastapi import FastAPI, HTTPException, File, UploadFile
from datetime import datetime
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware

import tensorflow as tf
import numpy as np
from PIL import Image
import io
import cv2
import smtplib
from email.message import EmailMessage
import random

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
    
    model = tf.keras.models.load_model("skin_disease_v2_80plus.h5") 
    print("AI Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")

class_names = ['akiec', 'bcc', 'bkl', 'mel', 'nv', 'vasc', 'normal']


# 2. MongoDB Connection Setup
MONGO_DETAILS = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.skin_app_database # Database Name

# Email Settings for OTP sending
SENDER_EMAIL = "tishanabeysinghe@gmail.com" 
APP_PASSWORD = "rwfx iuke bhyy ezuh"  

# Database Collections
otp_collection = database.get_collection("otps")
user_collection = database.get_collection("users") # Collection for users
prediction_collection = database.get_collection("predictions") # Collection for AI records
history_collection = database.get_collection("history") 


# EMAIL SENDING FUNCTION

def send_otp_email(receiver_email, otp):
    msg = EmailMessage()
    msg.set_content(f"Welcome to Skin Health App!\n\nYour Password Reset OTP is: {otp}\n\nPlease do not share this code with anyone.")
    msg['Subject'] = 'Skin App - Password Reset OTP'
    msg['From'] = SENDER_EMAIL
    msg['To'] = receiver_email

    try:
        # SMTP server connection and email sending
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(SENDER_EMAIL, APP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"OTP sent successfully to {receiver_email}")
    except Exception as e:
        print(f"Email sending failed: {e}")

# 3. Data Models for validation
class SignupRequest(BaseModel):
    full_name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

# History Record Model 
class HistoryRecord(BaseModel):
    id: str
    user_email: str
    condition: str
    risk: str
    confidence: str
    date: str
    timestamp: int


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

# OTP sending endpoint 
@app.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    user = await user_collection.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=404, detail="Email not found. Please check your email.")

    import random
    otp = str(random.randint(100000, 999999))

    await otp_collection.update_one(
        {"email": request.email},
        {"$set": {"otp": otp}},
        upsert=True
    )

    send_otp_email(request.email, otp)
    return {"success": True, "message": "OTP sent successfully to your email"}

# New Password make endpoint
@app.post("/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    record = await otp_collection.find_one({"email": request.email})
    
    if not record or record["otp"] != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP or OTP has expired")

    await user_collection.update_one(
        {"email": request.email},
        {"$set": {"password": request.new_password}}
    )

    await otp_collection.delete_one({"email": request.email})
    return {"success": True, "message": "Password reset successfully. You can now login."}


# OpenCV Skin Detection Function 

def is_skin_present(pil_image, min_percentage=10.0):

    # PIL Image to OpenCV format (BGR)
    open_cv_image = np.array(pil_image)
    open_cv_image = open_cv_image[:, :, ::-1].copy()

    hsv_image = cv2.cvtColor(open_cv_image, cv2.COLOR_BGR2HSV)

    # HSV Range for skin color
    lower_skin = np.array([0, 48, 80], dtype=np.uint8)
    upper_skin = np.array([20, 255, 255], dtype=np.uint8)

    skin_mask = cv2.inRange(hsv_image, lower_skin, upper_skin)

    skin_pixels = cv2.countNonZero(skin_mask)
    total_pixels = skin_mask.size
    skin_percentage = (skin_pixels / total_pixels) * 100

    return skin_percentage >= min_percentage, skin_percentage


# 5. PREDICT ENDPOINT 
@app.post("/predict")
async def predict_skin_disease(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        
        
        has_skin, skin_percentage = is_skin_present(image)
        
        
        if not has_skin:
            return {
                "success": False,
                "error": "Please upload a valid image of human skin.",
                "details": f"Only {round(skin_percentage, 2)}% skin color detected."
            }
        
        image = image.resize((300, 300))
        img_array = tf.keras.preprocessing.image.img_to_array(image)
        img_array = img_array / 255.0 
        
        img_array = np.expand_dims(img_array, axis=0)

        predictions = model.predict(img_array)
        predicted_class_index = np.argmax(predictions[0])
        predicted_class = class_names[predicted_class_index]
        
        confidence = round(float(np.max(predictions[0])) * 100, 2)

        if predicted_class == 'normal':
            return {
                "success": True,
                "prediction": "Healthy Skin",
                "message": "Good news! No signs of skin diseases detected. You have healthy skin.",
                "confidence": f"{confidence}%",
                "all_scores": {class_names[i]: float(predictions[0][i]) for i in range(len(class_names))}
            }
        
        else:
            return {
                "success": True,
                "prediction": predicted_class,
                "message": "A potential skin condition was detected. Please consult a dermatologist.",
                "confidence": f"{confidence}%",
                "all_scores": {class_names[i]: float(predictions[0][i]) for i in range(len(class_names))}
            }

    except Exception as e:
        return {"success": False, "error": str(e)}



# 6. HISTORY ENDPOINTS 

# 6.1 AI Result save to MongoDB 
@app.post("/history/save")
async def save_history(record: HistoryRecord):
    try:
        await history_collection.insert_one(record.dict())
        return {"success": True, "message": "Result saved to MongoDB"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 6.2 Get User's History Record 
@app.get("/history/{user_email}")
async def get_user_history(user_email: str):
    try:
        
        cursor = history_collection.find({"user_email": user_email}, {"_id": 0}).sort("timestamp", -1)
       
        records = await cursor.to_list(length=1000) 
        return records
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 6.3 Delete Record from History
@app.delete("/history/{record_id}")
async def delete_history(record_id: str):
    try:
        result = await history_collection.delete_one({"id": record_id})
        if result.deleted_count > 0:
            return {"success": True}
        else:
            raise HTTPException(status_code=404, detail="Record not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# 7. USER PROFILE 

class UserUpdate(BaseModel):
    name: str
    age: str = ""     
    gender: str = ""   
    district: str = "" 
    profile_pic: str = None 

# 7.1 Get User Profile (without password)
@app.get("/user/{email}")
async def get_user_profile(email: str):
    try:
        user = await user_collection.find_one({"email": email}, {"_id": 0, "password": 0})
        if user:
            return user
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 7.2 Update User Profile (full name and profile picture)
@app.put("/user/{email}")
async def update_user_profile(email: str, update_data: UserUpdate):
    try:
        await user_collection.update_one(
            {"email": email},
            {"$set": {"name": update_data.name,"age": update_data.age,
                "gender": update_data.gender,
                "district": update_data.district, "profile_pic": update_data.profile_pic}}
        )
        return {"success": True, "message": "Profile updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 7.3 Delete Account
@app.delete("/user/{email}")
async def delete_user_account(email: str):
    try:
        await user_collection.delete_one({"email": email})
        await history_collection.delete_many({"user_email": email}) 
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# 8. ADMIN DASHBOARD ENDPOINTS

@app.get("/admin/dashboard")
async def get_admin_dashboard():
    try:
        #  Total Users 
        total_users = await user_collection.count_documents({"role": {"$ne": "admin"}})
        
        #  Database all Scans
        cursor = history_collection.find()
        all_scans = await cursor.to_list(length=None)
        total_scans = len(all_scans)
        
        # scans for variables
        scans_today = 0
        total_confidence = 0
        disease_counts = {}
        
        
        today_midnight = datetime.combine(datetime.today(), datetime.min.time()).timestamp() * 1000
        
        for scan in all_scans:
            # Today scans count
            if scan.get("timestamp", 0) >= today_midnight:
                scans_today += 1
                
            # Average Confidence
            conf_str = str(scan.get("confidence", "0")).replace("%", "")
            try:
                total_confidence += float(conf_str)
            except:
                pass
                
            # Disease distribution count
            condition = scan.get("condition", "Unknown")
            disease_counts[condition] = disease_counts.get(condition, 0) + 1
            
        # Average Confidence calculation
        avg_confidence = round(total_confidence / total_scans) if total_scans > 0 else 0
        
        #  Recent Activity 
        sorted_scans = sorted(all_scans, key=lambda x: x.get("timestamp", 0), reverse=True)
        recent_activities = []
        for scan in sorted_scans[:3]:
            
            email = scan.get("user_email", "Unknown")
            short_name = email.split('@')[0][:5] if "@" in email else "User"
            
            recent_activities.append({
                "id": scan.get("id"),
                "condition": scan.get("condition"),
                "user": f"User_{short_name}", 
                "confidence": scan.get("confidence"),
                "timestamp": scan.get("timestamp")
            })
            
        #  Chart Data for disease distribution
        chart_data = []
        for condition_name, count in disease_counts.items():
            percentage = round((count / total_scans) * 100) if total_scans > 0 else 0
            chart_data.append({"name": condition_name, "percentage": percentage})

        return {
            "success": True,
            "total_users": total_users,
            "total_scans": total_scans,
            "scans_today": scans_today,
            "avg_confidence": f"{avg_confidence}%",
            "disease_distribution": chart_data,
            "recent_activity": recent_activities
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
# 9. ADMIN - GET ALL USERS


@app.get("/admin/users")
async def get_all_users():
    try:
        # password field ,user data
        cursor = user_collection.find({}, {"password": 0}) 
        all_users = await cursor.to_list(length=None)
        
        user_list = []
        for user in all_users:
            user_list.append({
                "id": str(user.get("_id", "")),
                "name": user.get("full_name", "Unknown User"),
                "email": user.get("email", "No Email"),
                "role": user.get("role", "Patient") 
                
            })
            
        return {"success": True, "users": user_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))  
    
# 10. ADMIN - DELETE USER

@app.delete("/admin/users/{email}")
async def admin_delete_user(email: str):
    try:
        #  delete the user from users collection
        delete_user = await user_collection.delete_one({"email": email})
        
        #  delete all history records of that user
        await history_collection.delete_many({"user_email": email})
        
        if delete_user.deleted_count == 1:
            return {"success": True, "message": "User deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="User not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
# 11. ADMIN - GET ALL RECORDS (HISTORY)

@app.get("/admin/records")
async def get_all_records():
    try:
        # Get history records from MongoDB
        cursor = history_collection.find()
        all_records = await cursor.to_list(length=None)
        
        # Sort records by timestamp in descending order
        sorted_records = sorted(all_records, key=lambda x: x.get("timestamp", 0), reverse=True)
        
        # MongoDB _id field is not JSON serializable, convert it to string
        for record in sorted_records:
            record["_id"] = str(record["_id"])
            
        return {"success": True, "records": sorted_records}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# 12. DOCTORS ENDPOINT
@app.get("/doctors/{district}")
async def get_doctors_by_district(district: str):
    try:
        # Case insensitive search for doctors in the specified district
        cursor = database.get_collection("doctors").find({"district": {"$regex": district, "$options": "i"}})
        doctors = await cursor.to_list(length=100)
        
        for doc in doctors:
            doc["_id"] = str(doc["_id"]) 
            
        return {"success": True, "doctors": doctors}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))    