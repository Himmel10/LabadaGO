# LabadaGO – Smart Laundry Pickup and Delivery Mobile Application

## Project Overview
LabadaGO is a mobile laundry service app connecting customers, laundry shops, riders, and an admin in one system. Built with React Native (Expo Go) and Supabase as the backend, it streamlines laundry pickup, delivery, and management for all roles.

### User Roles
- **Customer**: Register/login (2FA), browse shops, schedule orders, track status, pay (GCash, PayMaya, card, COD), rate/review, receive notifications, access promotions/loyalty/referral.
- **Laundry Shop Owner**: Register/login (2FA), manage shop/services/pricing, receive/confirm orders, assign riders, update status, view history, manage promotions, receive notifications.
- **Rider**: Register/login, view assignments, navigate via GPS, update status (with photo proof), receive notifications, view delivery history.
- **Admin**: Login, manage users, monitor orders, resolve complaints, generate analytics, manage shops/riders, access dashboards.

### Key Features
- User authentication (2FA)
- Push notifications, SMS, email alerts
- GPS navigation for riders
- Online and cash payment integration
- Order tracking with status updates
- Ratings, reviews, promotions, loyalty, referral
- Admin dashboards and reporting
- Role-based access control

### Tech Stack
- **Frontend**: React Native (Expo Go)
- **Backend/DB**: Supabase
- **Payments**: GCash, PayMaya, credit/debit, COD
- **Notifications**: Push, SMS, email

---

## Setup Instructions
1. Install [Node.js](https://nodejs.org/) and [Expo CLI](https://docs.expo.dev/get-started/installation/).
2. Clone this repository.
3. Run `npm install` to install dependencies.
4. Set up a Supabase project and configure environment variables.
5. Run `expo start` to launch the app in Expo Go.

---

## Group Members
- Larong, Charlie Mel
- Antigo, Arlon
- Encarnacion, Jinessa
- Rezare, Ronalyn

---

## License
MIT License
