# 🛠️ Tradie Materials Live NZ (TML NZ)

**Tradie Materials Live NZ** is a web application that helps New Zealand tradies compare material prices across hardware suppliers in one place. It aims to give kiwis centralized access to live product prices and stock avaliability, save time, reduce manual quote building, and improve procurement efficiency.

---

## 📦 Features

### ✅ Completed in MVP

- 💲 **Live Price Comparison (Mock Data)**  
  Displays simulated real-time pricing from multiple suppliers using mock data.

- 📍 **Supplier Listings (Static/Mocked)**  
  Users can browse mock product listings per supplier to simulate a multi-store comparison experience.

- 🧱 **Basic UI for Quote Building (Non-functional)**  
  Visual interface to simulate how users might build material quotes (logic not yet implemented).

---

### 🚧 Planned Features

- 🔄 **Real Live Price + Stock Integration**  
  Connect with official store APIs or scrapers to show actual prices and availability.

- 📍 **Geolocation-Based Store Discovery**  
  Automatically detect user's location and display nearby suppliers.

- 📄 **Functional Quote Generation**  
  Allow users to build, save, and download quotes using live data.

- 🔔 **Price Change Alerts**  
  Notify users when prices change for items in a saved quote.

- 🧾 **Invoice Generation from Quotes**  
  Convert approved quotes into professional invoices ready for sending or download.

- 📤 **Procurement Workflow Integration**  
  Enable ordering materials directly from suppliers through the app.

- 🔐 **User Accounts and History**  
  Let users save quotes, track past orders, and reuse templates via login functionality.

---

## 🧠 Inspiration

This app was inspired by my father — a boilermaker by trade who runs a trailer hire-pool — who often wasted time manually comparing prices and stock availability across multiple supplier websites. This process was frustrating, time-consuming, and often unreliable when prices changed last minute. TML NZ was created to solve that inefficiency and help tradies get quotes and invoices faster with up-to-date info.

---

## 🧑‍💻 Tech Stack - BUILT SOLELY USING BOLT.NEW

| Area        | Tech                                                                               |
| ----------- | ---------------------------------------------------------------------------------- |
| Frontend    | React.js + Tailwind CSS                                                            |
| Backend     | Node.js + Express.js                                                               |
| Database    | Supabase                                                                           |
| Deployment  | [Click to view deployed app - deployed using Netlify](https://tml-nz.netlify.app/) |
| Data Source | Simulated (real integration planned)                                               |

---

## 🚀 Getting Started

> ⚠️ This project was built in [Bolt](https://bolt.new) and exported with modifications. Setup may differ from typical React or Node.js apps.

### Prerequisites

- Node.js v20+
- Terminal/Git
- Netlify CLI (optional for deployment)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tradie-materials-live-nz.git
   cd tradie-materials-live-nz
   ```
