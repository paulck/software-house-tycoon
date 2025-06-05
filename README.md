# 🏢 Software House Tycoon

Un videogioco gestionale fullstack dove devi far crescere la tua azienda tech bilanciando talenti e risorse per evitare la bancarotta.

## 🚀 Quick Start

### Prerequisiti
- Docker e Docker Compose
- Git

### Installazione e Avvio

```bash
# 1. Entra nella cartella del progetto
cd software-house-tycoon

# 2. Avvia l'applicazione con Docker
docker-compose up --build

# 3. Accedi all'applicazione
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

## 🎮 Come Giocare

### Obiettivo
Gestire una software house evitando la bancarotta. Devi bilanciare:
- **Developers** per completare progetti
- **Commerciali** per generare nuovi progetti  
- **Patrimonio** vs **Costi mensili**

### Condizioni Iniziali
- 💰 **5.000€** di patrimonio
- 👨‍💻 **1 Developer** (Marco Rossi - Seniority 3 - €1.500/mese)
- 🎯 **1 Commerciale** (Laura Bianchi - Esperienza 2 - €1.100/mese)
- 📊 **Costi mensili totali**: €2.600

### Schermate Principali

#### 🏗️ Produzione
- Visualizza developers disponibili e occupati
- Gestisci progetti in pending, attivi e completati
- Assegna progetti ai developers liberi
- Monitora progress bar dei progetti in corso

#### 💼 Sales  
- Gestisci commerciali per generare progetti
- Tempo generazione: dipende dall'esperienza
- Valore progetti: basato sull'esperienza del commerciale
- I progetti vanno automaticamente in Produzione

#### 🧑‍💼 HR (Risorse Umane)
- Mercato delle risorse disponibili
- Assumi developers e commerciali
- Controlla costi di assunzione e stipendi
- Visualizza riepilogo team attuale

## 🛠️ Sviluppo

### Comandi Utili

```bash
# Avvio completo
docker-compose up --build

# Solo backend
docker-compose up backend

# Solo frontend  
docker-compose up frontend

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart
docker-compose restart

# Cleanup
docker-compose down
docker system prune -f
```

### Struttura del Progetto

```
software-house-tycoon/
├── frontend/          # React + Vite + Tailwind
├── backend/           # Node.js + Express + SQLite
├── database/          # File SQLite e migrations
├── docker-compose.yml # Orchestrazione container
└── README.md
```

## 📊 Database

- **SQLite3** con persistenza tramite volume Docker
- **Auto-inizializzazione** tabelle e seed data
- **Backup**: copia il file `./database/game.db`

## 🚀 Deploy

```bash
# Production build
docker-compose -f docker-compose.prod.yml up --build

# Deploy su server
scp -r . user@server:/path/to/app
ssh user@server "cd /path/to/app && docker-compose up -d"
```

## 🤝 Contribuire

1. Fork del progetto
2. Crea feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Apri Pull Request

## 📝 License

Distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.
