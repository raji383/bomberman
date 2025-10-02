package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
)

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}
	http.ServeFile(w, r, "index.html")
}

type Player struct {
	Name  string `json:"name"`
	Rank  int    `json:"Rank"`
	Score int    `json:"Score"`
	Time  string `json:"time"`
}

func ScoreHandler(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	name := r.FormValue("name")
	time := r.FormValue("time")
	scoreStr := r.FormValue("score")

	score, err := strconv.Atoi(scoreStr)
	if err != nil {
		http.Error(w, "Invalid score", http.StatusBadRequest)
		return
	}

	var players []Player
	filePath := "scores.json"

	if data, err := os.ReadFile(filePath); err == nil {
		json.Unmarshal(data, &players)
	}

	players = append(players, Player{
		Name:  name,
		Score: score,
		Time:  time,
	})

	sort.Slice(players, func(i, j int) bool {
		return players[i].Score > players[j].Score
	})

	for i := range players {
		players[i].Rank = i + 1
	}

	jsonData, err := json.MarshalIndent(players, "", "  ")
	if err != nil {
		http.Error(w, "Failed to encode data", http.StatusInternalServerError)
		return
	}

	if err := os.WriteFile(filePath, jsonData, 0o644); err != nil {
		http.Error(w, "Failed to save data", http.StatusInternalServerError)
		return
	}

	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func Lodscroe(w http.ResponseWriter, r *http.Request) {
	k := r.Header.Get("Accept")

	if k != "*/*" {

		http.Redirect(w, r, "/", http.StatusSeeOther) // 303
		return
	}
	var players []Player
	filePath := "scores.json"

	if data, err := os.ReadFile(filePath); err == nil {
		json.Unmarshal(data, &players)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(players)
}

func StyleHandler(w http.ResponseWriter, r *http.Request) {
	filePath := strings.TrimPrefix(r.URL.Path, "/")
	File, err := os.Stat(filePath)
	if err != nil || File.IsDir() {
		http.Redirect(w, r, "/", http.StatusSeeOther) // 303
		return
	}
	http.ServeFile(w, r, filePath)
}

func main() {
	http.HandleFunc("/static/", StyleHandler)
	http.HandleFunc("/", HomeHandler)
	http.HandleFunc("/loadscroe", Lodscroe)
	http.HandleFunc("/score", ScoreHandler)
	fmt.Println("Server started at http://localhost:8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}
