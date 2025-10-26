/* src/utils/aiHelper.js (Final, Robust Version) */

// --- DEPENDENCY IMPORTS ---
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');
require('dotenv').config(); // Ensure environment variables are loaded

// --- 1. CONFIGURATION & CONDITIONAL INITIALIZATION ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let model; // Declare model variable

if (GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // This is a stable, widely available, and powerful model.
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); 
    console.log("✅ Google AI Helper initialized successfully.");
} else {
    console.warn("!!! WARNING: GEMINI_API_KEY not found in .env file. AI generation will be disabled. !!!");
    model = null; // Set model to null if no key is found
}

// --- HELPER FUNCTION FOR PDF PARSING ---
async function getTextFromPdf(filePath) {
    try {
        const fullPath = path.resolve(filePath);
        const dataBuffer = await fs.readFile(fullPath);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        console.error(`Error parsing PDF at ${filePath}:`, error);
        return 'Could not read resume content.';
    }
}


// --- 2. MAIN AI GENERATION FUNCTION ---
async function generateApplicationCoverLetter(user, job) {
    // Fail gracefully if the model was never initialized
    if (!model) {
        console.error("Attempted to call generateApplicationCoverLetter, but AI model is not configured.");
        return "AI Model is not configured. Please check the server's GEMINI_API_KEY.";
    }

    const resumeText = user.resumeUrl ? await getTextFromPdf(user.resumeUrl) : 'No resume provided.';
    
    // --- 3. ROBUST PROMPT ENGINEERING ---
    const masterPrompt = `
        **Role:** You are a highly skilled career coach and professional copywriter. Your task is to draft a complete, compelling, and professional cover letter based on the provided data.

        **Objective:** Write a cover letter from the applicant, ${user.name}, to the hiring manager at ${job.company} for the specific role of ${job.title}.

        ### Applicant's Data:
        - **Name:** ${user.name}
        - **Skills Listed in Profile:** ${user.skills.join(', ')}
        - **Full Resume Content:**
        ---
        ${resumeText}
        ---

        ### Target Job's Data:
        - **Position:** ${job.title}
        - **Company:** ${job.company}
        - **Job Description:**
        ---
        ${job.description}
        ---

        ### Your Task & Constraints:
        1.  **Synthesize, Do Not List:** Your primary goal is to synthesize information. Read the applicant's resume and the job description, find the overlapping skills and experiences, and weave them into a convincing narrative. Do NOT just list the skills.
        2.  **Address the Job Directly:** The cover letter must feel custom-written for this specific job. Reference keywords and requirements from the job description.
        3.  **Tone:** The tone should be professional, confident, and enthusiastic.
        4.  **Structure:** Use a standard, modern cover letter format. It should include an introduction, 1-2 body paragraphs highlighting the match, and a concluding paragraph with a clear call to action.
        5.  **Output:** Respond ONLY with the raw text of the cover letter. Do not include any introductory text, explanations, or markdown formatting. Start directly with the salutation (e.g., "Dear Hiring Manager,").
    `;

    // --- 4. API CALL WITH ERROR HANDLING ---
    try {
        console.log(`--- Calling Gemini API for cover letter generation for user ${user._id}... ---`);
        const result = await model.generateContent(masterPrompt);
        const response = await result.response;
        const generatedText = response.text();

        console.log("--- Successfully received AI-generated cover letter. ---");
        return generatedText;
        
    } catch (error) {
        console.error("!!! CRITICAL: An error occurred while calling the AI model:", error.message || error);
        
        // Return a user-friendly error message that still gets stored in the application
        let errorMessage = `An error occurred with the AI service: ${error.message}`;
        if (error.message && error.message.includes('404')) {
             errorMessage = "AI Generation Failed: The specified model was not found. This indicates a problem with the API key or project configuration on the server.";
        } else if (error.message && error.message.includes('API key not valid')) {
            errorMessage = "AI Generation Failed: The API key is invalid. Please check the server configuration.";
        }
        
        return `[Automated Message: The AI-generated cover letter could not be created. Reason: ${errorMessage}]`;
    }
}

module.exports = { generateApplicationCoverLetter };