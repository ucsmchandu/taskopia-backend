

const buildRagPrompt = async (question, chunks) => {

    const context = chunks.map((chunk) => {
        return `
        [source: ${chunk.source}, chunk: ${chunk.chunkIndex}]

        ${chunk.text}
        `;
    }).join("\n -------------------\n");

    //
    return `
    
    You are Taskopia's AI help assistant.

    Answer the user's question using ONLY the context provided below.

    If the answer cannot be found in the context, reply exactly:

    "I don't have enough information from Taskopia's knowledge base to answer that."

    ======================
    CONTEXT
    ======================

    ${context}

    ======================
    USER QUESTION
    ======================

    ${question}

    `;

}

module.exports=buildRagPrompt;