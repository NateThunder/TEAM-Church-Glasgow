# TEAM Church Glasgow Website


<p align="center">
  <strong>Official website for TEAM Church Glasgow</strong><br/>
  Built with modern web technologies and deployed on Netlify
</p>

---

## 🔗 Live Site

🌍 https://team-church-glasgow.netlify.app/

---

## 🛠 Tech Stack

<p>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white" />
</p>

---

## 📖 About the Project

This repository contains the source code for the official website of **TEAM Church Glasgow**, a Christian community based in Glasgow, Scotland.

The website provides:

- Information about the church
- Service times and location
- Community details
- Contact information

The goal of the project is to provide a clean, responsive, and accessible web presence for the church.

---

## 📸 Website Preview

<p align="center">
  <img src="screenshot.png" alt="TEAM Church Glasgow Website Preview" width="800"/>
</p>

---

## Stripe Giving Setup

The `/give` page now starts a Stripe Checkout session through a Netlify function.

Required Netlify environment variable:

- `STRIPE_SECRET_KEY` = your Stripe secret key

Optional client override:

- `VITE_STRIPE_CHECKOUT_ENDPOINT` = alternate checkout endpoint if you are not using the default `/.netlify/functions/create-stripe-checkout`

Local testing note:

- Use `netlify dev` if you want the frontend and the Netlify function to run together locally. `npm run dev` only starts the Vite app.
