package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/smtp"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"github.com/supabase-community/supabase-go"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte("your_secret_key_2025")

type User struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type RequestBody struct {
	ID            string `json:"id,omitempty"`
	Header        string `json:"header"`
	Title         string `json:"title"`
	Duration      string `json:"duration"`
	SenderID      string `json:"sender_id"`
	ReceiverEmail string `json:"receiver_email"`
	TimeStart     string `json:"time_start"`
	TimeEnd       string `json:"time_end"`
}

func enableCORS(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PATCH, PUT")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func sendDiscord(content string) {
	webhookURL := os.Getenv("DISCORD_WEBHOOK_URL")
	payload := map[string]string{"content": content}
	jsonData, _ := json.Marshal(payload)
	http.Post(webhookURL, "application/json", bytes.NewBuffer(jsonData))
}

func sendEmail(toEmail string, subject string, body string) {
	from := "p.rapong.2409@gmail.com"
	pass := os.Getenv("GMAIL_APP_PASSWORD")
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"
	message := []byte("To: " + toEmail + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"Content-Type: text/plain; charset=UTF-8\r\n\r\n" +
		body + "\r\n")
	auth := smtp.PlainAuth("", from, pass, smtpHost)
	_ = smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{toEmail}, message)
}

func formatDisplayTime(t string) string {
	if len(t) >= 16 {
		return t[:10] + " **TIME** " + t[11:16]
	}
	return t
}

func handleRegister(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" {
		return
	}
	var user User
	json.NewDecoder(r.Body).Decode(&user)
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	client, _ := supabase.NewClient(os.Getenv("SUPABASE_URL"), os.Getenv("SUPABASE_KEY"), nil)
	row := map[string]interface{}{"email": user.Email, "username": user.Username, "password": string(hashedPassword)}
	_, _, err := client.From("users").Insert(row, false, "", "", "").Execute()
	if err != nil {
		http.Error(w, "Fail", http.StatusBadRequest)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" {
		return
	}
	var creds struct{ Email, Password string }
	json.NewDecoder(r.Body).Decode(&creds)
	client, _ := supabase.NewClient(os.Getenv("SUPABASE_URL"), os.Getenv("SUPABASE_KEY"), nil)
	var users []map[string]interface{}
	client.From("users").Select("*", "exact", false).Eq("email", creds.Email).ExecuteTo(&users)
	if len(users) == 0 || bcrypt.CompareHashAndPassword([]byte(users[0]["password"].(string)), []byte(creds.Password)) != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": users[0]["id"], "username": users[0]["username"], "exp": time.Now().Add(time.Hour * 72).Unix(),
	})
	tokenString, _ := token.SignedString(jwtKey)
	json.NewEncoder(w).Encode(map[string]string{"token": tokenString, "username": users[0]["username"].(string), "user_id": users[0]["id"].(string)})
}

func handleCreateRequest(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" {
		return
	}
	var req RequestBody
	json.NewDecoder(r.Body).Decode(&req)
	client, _ := supabase.NewClient(os.Getenv("SUPABASE_URL"), os.Getenv("SUPABASE_KEY"), nil)

	var sender []map[string]interface{}
	client.From("users").Select("username", "exact", false).Eq("id", req.SenderID).ExecuteTo(&sender)
	sName := "Unknown User"
	if len(sender) > 0 {
		sName = sender[0]["username"].(string)
	}

	var receiver []map[string]interface{}
	client.From("users").Select("id, username", "exact", false).Eq("email", req.ReceiverEmail).ExecuteTo(&receiver)
	if len(receiver) == 0 {
		http.Error(w, "Not Found", http.StatusNotFound)
		return
	}
	rID := receiver[0]["id"].(string)
	rName := receiver[0]["username"].(string)

	row := map[string]interface{}{
		"category": req.Header, "title": req.Title, "description": req.Duration,
		"sender_id": req.SenderID, "receiver_id": rID, "status": "pending",
		"sender_name": sName, "receiver_name": rName,
		"remark": fmt.Sprintf("%s|%s", req.TimeStart, req.TimeEnd),
	}
	client.From("requests").Insert(row, false, "", "", "").Execute()

	msg := fmt.Sprintf("--------------------------------------------------\n🔔 @everyone\n## 💖 มีคำขอใหม่ส่งถึงคุณ!\n> 📌 **1.หัวข้อ:** %s\n> 👤 **2.จาก:** %s\n> 📩 **3.ถึง:** %s\n> 📝 **4.รายละเอียด:** %s\n---\n> 🗓️ **5.เริ่ม:** %s\n> 🏁 **6.จบ:** %s\n> ⏱️ **7.ระยะเวลา:** `%s`",
		req.Header, sName, rName, req.Title, formatDisplayTime(req.TimeStart), formatDisplayTime(req.TimeEnd), req.Duration)

	sendDiscord(msg)
	go sendEmail(req.ReceiverEmail, "ได้รับคำขอใหม่: "+req.Header, msg)
	w.WriteHeader(http.StatusCreated)
}

func handleGetMyRequests(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	uID := r.URL.Query().Get("user_id")
	client, _ := supabase.NewClient(os.Getenv("SUPABASE_URL"), os.Getenv("SUPABASE_KEY"), nil)
	var data []map[string]interface{}
	client.From("requests").Select("*", "exact", false).Or(fmt.Sprintf("sender_id.eq.%s,receiver_id.eq.%s", uID, uID), "").ExecuteTo(&data)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func handleUpdateStatus(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" {
		return
	}
	var body struct{ ID, Status string }
	json.NewDecoder(r.Body).Decode(&body)
	client, _ := supabase.NewClient(os.Getenv("SUPABASE_URL"), os.Getenv("SUPABASE_KEY"), nil)

	updateData := map[string]interface{}{"status": body.Status, "processed_at": time.Now().Format(time.RFC3339)}
	client.From("requests").Update(updateData, "", "").Eq("id", body.ID).Execute()

	var results []map[string]interface{}
	client.From("requests").Select("*", "exact", false).Eq("id", body.ID).ExecuteTo(&results)

	if len(results) > 0 {
		item := results[0]
		remarkStr := fmt.Sprintf("%v", item["remark"])
		parts := strings.Split(remarkStr, "|")
		timeStartPart, timeEndPart := "Unknown", "Unknown"
		if len(parts) == 2 {
			timeStartPart = formatDisplayTime(parts[0])
			timeEndPart = formatDisplayTime(parts[1])
		}

		emoji, statusText := "✅", "อนุมัติ"
		if body.Status == "rejected" {
			emoji, statusText = "❌", "ไม่อนุมัติ"
		}

		msg := fmt.Sprintf("--------------------------------------------------\n📢 @everyone\n## %s ผลการพิจารณาคำขอ!\n> 📊 **สถานะ:** `%s`\n> 👤 **จาก:** %v\n> 📩 **ถึง:** %v\n> 📌 **หัวข้อ:** %v\n> 📝 **รายละเอียด:** %v\n> 🗓️ **เริ่ม:** %s\n> 🏁 **จบ:** %s\n> ⏱️ **ระยะเวลา:** `%v`\nhttps://lover-frontend-ashen.vercel.app",
			emoji, statusText, item["sender_name"], item["receiver_name"], item["category"], item["title"], timeStartPart, timeEndPart, item["description"])

		sendDiscord(msg)
	}
	w.WriteHeader(http.StatusOK)
}

func handleGetAllUsers(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	client, _ := supabase.NewClient(os.Getenv("SUPABASE_URL"), os.Getenv("SUPABASE_KEY"), nil)
	var users []map[string]interface{}
	client.From("users").Select("id, email, username", "exact", false).ExecuteTo(&users)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func main() {
	godotenv.Load()
	http.HandleFunc("/api/register", handleRegister)
	http.HandleFunc("/api/login", handleLogin)
	http.HandleFunc("/api/request", handleCreateRequest)
	http.HandleFunc("/api/my-requests", handleGetMyRequests)
	http.HandleFunc("/api/update-status", handleUpdateStatus)
	http.HandleFunc("/api/users", handleGetAllUsers)
	fmt.Println("Server is running on port 8080...")
	http.ListenAndServe(":8080", nil)
}
