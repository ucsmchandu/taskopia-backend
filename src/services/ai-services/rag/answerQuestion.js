const buildRagPrompt=require('./utils/buildRagPrompt');
const searchRelevantChunks=require('./utils/searchRelevantChunks')
const ai=require("../initialize-ai")

const answerQuestion=async(req,res)=>{
    const {question}=req.body;
    try {

        if(typeof question!=='string' || question.trim()===""){
            return res.status(400).json({
                message:"question required!"
            })
        }
        
        // get the chunks
        const chunks=await searchRelevantChunks(question);

        if(!chunks.length){
            return res.status(404).json({
                answer: "I could'nt find any relevant information in TASKOPIA's knowledge base.",
                sources:[]
            });
        }

        // build prompt
        const prompt=await buildRagPrompt(question,chunks);

        // ask gemini
        const response=await ai.models.generateContent({
            model:"gemini-3.5-flash",
            contents:prompt
        });

        const answer=response.text;

        // return the answer ehre

        return res.status(200).json({
            answer,
            sources:chunks.map(chunk=>({
                source:chunk.source,
                chunkIndex:chunk.chunkIndex,
                score:chunk.score
            }))
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}

module.exports=answerQuestion;