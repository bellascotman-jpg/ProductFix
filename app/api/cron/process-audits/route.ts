import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateFindings } from '@/lib/audit/engine'

export const runtime='nodejs'
export const maxDuration=60

export async function GET(request:Request){
 const secret=process.env.CRON_SECRET
 const auth=request.headers.get('authorization')
 if(!secret||auth!==`Bearer ${secret}`)return NextResponse.json({error:'Unauthorized'},{status:401})
 const db=createAdminClient();const {data:audits,error}=await db.from('audits').select('id,domain').eq('status','ANALYZING').limit(3)
 if(error)return NextResponse.json({error:'Unable to load pending audits.'},{status:500})
 const results=[]
 for(const audit of audits??[]){try{await db.from('audits').update({status:'GENERATING_FINDINGS',current_stage:'GENERATING_FINDINGS'}).eq('id',audit.id);const result=await generateFindings(db,audit.id);await db.from('audits').update({status:'COMPLETED',current_stage:'COMPLETED',overall_score:result.overallScore,completed_at:new Date().toISOString()}).eq('id',audit.id);results.push({id:audit.id,status:'completed'})}catch(error){const message=error instanceof Error?error.message:'Unexpected processing error.';await db.from('audits').update({status:'ANALYSIS_FAILED',current_stage:'GENERATING_FINDINGS',failed_at:new Date().toISOString(),error_code:'ANALYSIS_FAILED',error_message:message}).eq('id',audit.id);results.push({id:audit.id,status:'failed'})}}
 return NextResponse.json({processed:results})
}
