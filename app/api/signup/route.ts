import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"; 

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {email,password,name} = body;
        if(!email||!password||!name){
            return NextResponse.json({error:"Missing required fields"},{status:400})
        } 
        const existing = await prisma.user.findUnique({ 
            where : {email}
        })
        if(existing){
            return NextResponse.json({error:"User aldredy Exists"},{status:400})
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const user = await prisma.user.create({
            data:{
                email,
                name,
                password:hashedPassword
            }
        })
        return NextResponse.json({message:"User created Successfully",user},{status:201});
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error in Signup"},
            { status: 500}
        );
    }
}
