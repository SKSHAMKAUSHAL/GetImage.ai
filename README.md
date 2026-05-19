<div align="center">
  <img src="public/favicon.ico" alt="GetImage.ai Logo" width="100" />
  
  # GetImage.ai
  
  **Turn imagination into visual reality with fast, progressive AI image generation.**
  
  [![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![Zustand](https://img.shields.io/badge/Zustand-State-black?style=for-the-badge&logo=react)](https://zustand-demo.pmnd.rs/)

  [Live Demo](#) • [Report Bug](https://github.com/SKSHAMKAUSHAL/GetImage.ai/issues) • [Request Feature](https://github.com/SKSHAMKAUSHAL/GetImage.ai/issues)
</div>

---

## 🌟 Overview

**GetImage.ai** is a premium, high-performance web application designed to generate AI imagery instantly. Built to provide an exceptional user experience, the application utilizes a **progressive generation pipeline**—delivering a blazing-fast preview image first, while seamlessly upgrading it to a High-Quality SDXL render in the background.

Designed with a modern, glassmorphic UI and flawless state management, it provides professional-grade tools like built-in image cropping and persistent generation galleries.

## ✨ Key Features

- ⚡ **Progressive Generation Pipeline:** Instantly returns a fast preview (via Pollinations API) to keep the user engaged, then seamlessly hot-swaps to a High-Quality SDXL image (via Hugging Face) in the background.
- 🎨 **Built-in Image Editor:** Includes a canvas crop tool (`react-image-crop`) allowing users to edit and reframe their generated images directly in the browser.
- 🛑 **Flawless Async UX:** Implements internal `AbortController` logic to instantly kill pending API calls if a user changes their prompt or starts a new generation, entirely preventing rate-limiting and connection queuing.
- 💾 **Persistent Gallery:** All generations are saved to a PostgreSQL database via **Supabase**. Images are locally cached using `localStorage` for zero-latency load times when returning to the app.
- 📱 **Mobile-First & Premium UI:** Fully responsive design utilizing Tailwind CSS, featuring collapsible sidebars, smooth animations, and curated dark-mode aesthetics.

## 🛠️ Technology Stack

- **Framework:** [Next.js (App Router)](https://nextjs.org/)
- **UI/Styling:** [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Database / Backend:** [Supabase](https://supabase.com/)
- **Image Editing:** [React Image Crop](https://www.npmjs.com/package/react-image-crop)
- **AI Integration:** Pollinations AI (Previews) & Hugging Face SDXL (High Quality)

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

Ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- A Supabase Account (for database setup)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SKSHAMKAUSHAL/GetImage.ai.git
   cd GetImage.ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add the following keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   HUGGING_FACE_API_KEY=your_hf_api_key_here
   ```

4. **Initialize the Database:**
   Run the provided `supabase_schema.sql` script inside your Supabase SQL editor to create the `generations` table.

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at [http://localhost:3000](http://localhost:3000).

## 🧠 System Architecture & Edge Cases Handled

During development, several engineering challenges were addressed to ensure production readiness:
- **Rate-Limiting Prevention:** By utilizing `AbortController` within the Zustand store, the app prevents API traffic jams. Old requests are immediately aborted when new ones are dispatched.
- **Cold Start Mitigation:** The progressive rendering pipeline prevents users from waiting 15+ seconds staring at a loader. They receive a 2-second preview, while the heavy lifting happens asynchronously.
- **Resilient Storage:** Supabase database failures or timeouts gracefully fall back to `localStorage` caching so the UI remains interactive even on poor networks.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <i>Developed with ❤️ by SKSHAMKAUSHAL</i>
</div>
