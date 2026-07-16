const ai=require('../../initialize-ai');

const generateEmbedding=async(text,taskType)=>{
    try {
        const response=await ai.models.embedContent({
            model:"gemini-embedding-001",
            contents:text,
            config:{
                taskType:taskType
            }
        });

        // extrt the embedding vector
        const embedding=response.embeddings[0].values;
        console.log("dimensions: ",embedding.length);
        
        return embedding;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

module.exports=generateEmbedding;