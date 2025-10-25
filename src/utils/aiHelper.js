/* src/utils/aiHelper.js (Final Corrected Version) */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getTextFromPdf(filePath) {
    try {
        const fullPath = path.resolve(filePath); // Ensure we have the absolute path
        const dataBuffer = await fs.readFile(fullPath);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        console.error(`Error parsing PDF at ${filePath}:`, error);
        return 'Could not read resume content.';
    }
}

async function generateApplicationCoverLetter(user, job) {
    const resumeText = user.resumeUrl ? await getTextFromPdf(user.resumeUrl) : 'No resume provided.';

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
        **Role:** You are a helpful career assistant. Your task is to draft a professional and compelling cover letter for a job application.

        **Objective:** Write a cover letter from the applicant, ${user.name}, to the hiring manager at ${job.company} for the position of ${job.title}.

        **Job Details:**
        - **Position:** ${job.title}
        - **Company:** ${job.company}
        - **Description:** ${job.description}

        **Applicant's Information:**
        - **Name:** ${user.name}
        - **Skills Listed in Profile:** ${user.skills.join(', ')}
        - **Full Resume Content:**
        ---
        ${resumeText}
        ---

        **Instructions:**
        1.  **Synthesize, Do Not Just List:** Weave the applicant's skills and experiences from their resume into a narrative that directly addresses the requirements in the job description.
        2.  **Tone:** The tone should be professional, enthusiastic, and confident.
        3.  **Structure:** Follow a standard cover letter format (Introduction, Body Paragraphs, Conclusion).
        4.  **Customization:** Make it clear that the applicant has read the job description and is genuinely interested in this specific role at this specific company.
        5.  **Output:** Provide only the text of the cover letter, starting with a professional salutation.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating content with AI:', error);
        return 'There was an error generating the cover letter. Please try again later.';
    }
}

module.exports = { generateApplicationCoverLetter };