
# 🚀 QUICK-START DEPLOYMENT

### 1. UPLOAD TO GITHUB
1. Create a new repository on GitHub named `carb-check`.
2. Open your terminal in this folder and run:
   ```bash
   git init
   git add .
   git commit -m "Initial launch"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/carb-check.git
   git push -u origin main
   ```

### 2. CONNECT TO VERCEL
1. Go to [Vercel.com](https://vercel.com) and click **"Add New Project"**.
2. Select your `carb-check` repository.
3. **CRITICAL:** Add an Environment Variable:
   - **Key:** `API_KEY`
   - **Value:** `YOUR_GEMINI_API_KEY`
4. Click **Deploy**.

### 3. SQUARESPACE SETUP
1. In Squarespace DNS, add an **A Record**:
   - Host: `@`
   - IP: `76.76.21.21`
2. Add a **CNAME Record**:
   - Host: `www`
   - Value: `cname.vercel-dns.com`
