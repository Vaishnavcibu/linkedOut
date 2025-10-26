/* listModels.js - A utility to check available Gemini models for your API key */

// Use require for dotenv as this is a simple CommonJS script
require('dotenv').config();
const fetch = require('node-fetch'); // You might need to install this: npm install node-fetch

// --- Configuration ---
const API_KEY = process.env.GEMINI_API_KEY;
const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

// --- Main Function to List Models ---
async function listAvailableModels() {
    console.log("--- Checking your API key and fetching available models... ---");

    if (!API_KEY) {
        console.error("\n!!! CRITICAL ERROR: GEMINI_API_KEY not found in your .env file.");
        console.error("Please ensure your .env file exists and contains the correct API key.\n");
        return;
    }

    try {
        const response = await fetch(API_ENDPOINT);

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`API call failed with status ${response.status}: ${errorBody.error.message}`);
        }

        const data = await response.json();

        if (!data.models || data.models.length === 0) {
            console.log("\n--- No models found for this API key. ---");
            console.log("This might indicate an issue with your Google Cloud project setup or permissions.\n");
            return;
        }

        console.log("\n✅ Success! The following models are available for your API key:\n");

        data.models.forEach(model => {
            // Check if the model supports the 'generateContent' method, which is what we use.
            if (model.supportedGenerationMethods.includes('generateContent')) {
                console.log("==============================================");
                console.log(`  Display Name: ${model.displayName}`);
                console.log(`  Model Name (ID): >>> ${model.name.replace('models/', '')} <<<`); // This is the ID to use in your code
                console.log(`  Description: ${model.description.substring(0, 100)}...`);
                console.log("==============================================\n");
            }
        });
        
        console.log("ACTION: Copy one of the 'Model Name (ID)' values (e.g., 'gemini-1.5-flash-latest') and paste it into your aiHelper.js file.");

    } catch (error) {
        console.error("\n!!! FAILED to fetch models. An error occurred: !!!");
        console.error(`Error: ${error.message}`);
        console.error("\nTroubleshooting Tips:");
        console.error("1. Double-check that your GEMINI_API_KEY in the .env file is 100% correct.");
        console.error("2. Ensure the 'Generative Language API' is enabled in your Google Cloud Project.");
        console.error("3. Make sure you have a stable internet connection.\n");
    }
}

// --- Run the function ---
listAvailableModels();