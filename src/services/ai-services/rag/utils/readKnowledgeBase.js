const express=require('express')
const fs=require('node:fs/promises')
const path=require('node:path')

const readKnowledgeBase=async()=>{
    try {
        const folderPath=path.join(__dirname,"..","knowledge-base")
        // console.log(__dirname);
        // console.log(folderPath);

        let files=await fs.readdir(folderPath);
        // console.log(files);

        const knowledge=[];

        for(const file of files){
            if(!file.endsWith(".md")) continue;

            const filePath=path.join(folderPath,file);

            const content=await fs.readFile(filePath,"utf-8");

            knowledge.push({
                source:file,
                content:content
            })
        }

        return knowledge;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports=readKnowledgeBase;