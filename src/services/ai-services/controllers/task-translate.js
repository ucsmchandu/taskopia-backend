const express = require('express')
const ai = require('../initialize-ai')


/**
 * It helps to translate the task details like description to translate in requested language.
 * 
 * @param {string} req - it takes the requested language.
 * @param {string} res - it returns the translated text. 
 */
const taskDetailsTranslate = async (req, res) => {
    try {
        // const text = "Looking for a helper to assist with lifting, carrying, and shifting various items. The task involves general manual labor and careful handling of belongings.";
        // const lang = "telugu"
        /**
         * here we translate the english text into requested language.
         * 
         * it takes two inputs:
         * text
         * language
         */

        const {taskDescription,requestedLanguage}=req.body;

        if(!requestedLanguage?.trim()){
            return res.status(400).json({
                error:"Language is required."
            })
        }

        if(!taskDescription?.trim()){
            return res.status(400).json({
                error:"Task description is needed."
            })
        }

        const prompt = `
        Translate the following English text into the specified target language. Preserve the original meaning, tone, and intent.
        Keep the translation natural, clear, and fluent for the target language. Do not add any extra explanation or commentary. 
        Return only the translated text.

        Text to translate:
        ${taskDescription}

        Target language:
        ${requestedLanguage}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt
        });
        
        const rawText=response?.text || "";

        return res.status(200).json({
            translatedText:rawText
        });
    } catch (err) {
        // console.log(err);
        return res.status(500).json({
            error: "Failed to translate the text.",
            details: err.message
        })
    }
}

module.exports = taskDetailsTranslate;