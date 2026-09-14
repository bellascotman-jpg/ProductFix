import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateFindings } from '@/lib/audit/engine'
export const runtime='nodejs'
export const maxDuration=60
export async function GET(request:Request){
 const secret=process.env.CRON_SECRET;if(!secret||request.headers.get('authorization')!==`Bearer ${secret}`)return NextResponse.json({error:'Unauthorized'},{status:401})
 const db=createAdminClient();const {data:audits,error}=await db.from('audits').select('id,domain,user_id').eq('status','ANALYZING').limit(3);if(error)return NextResponse.json({error:'Unable to load pending audits.'},{status:500})
 const results=[]
 for(const audit of audits??[]){try{await db.from('audits').update({status:'GENERATING_FINDINGS',current_stage:'GENERATING_FINDINGS'}).eq('id',audit.id);const result=await generateFindings(db,audit.id);const {data:findings}=await db.from('audit_findings').select('severity,title,recommended_fix,source_url').eq('audit_id',audit.id).order('priority').limit(100);const make=(level:string)=>(findings??[]).filter(f=>f.severity===level||(level==='High'&&f.severity==='Critical')).map(f=>({title:f.title,fix:f.recommended_fix,sourceUrl:f.source_url}));await db.from('reports').upsert({audit_id:audit.id,user_id:audit.user_id,status:'COMPLETED',executive_summary:result.findingCount?`The public pages successfully crawled for ${audit.domain} produced ${result.findingCount} evidence-based findings. Recommendations are based only on observable page evidence.`:`No material issues were detected by the current public-page rules for ${audit.domain}.`,action_plan:{fixImmediately:make('High'),fixNext:make('Medium'),optimizeLater:make('Low')},share_enabled:false},{onConflict:'audit_id'});await db.from('audits').update({status:'COMPLETED',current_stage:'COMPLETED',overall_score:result.overallScore,completed_at:new Date().toISOString()}).eq('id',audit.id);results.push({id:audit.id,status:'completed'})}catch(error){const message=error instanceof Error?error.message:'Unexpected processing error.';await db.from('audits').update({status:'ANALYSIS_FAILED',current_stage:'GENERATING_FINDINGS',failed_at:new Date().toISOString(),error_code:'ANALYSIS_FAILED',error_message:message}).eq('id',audit.id);results.push({id:audit.id,status:'failed'})}}
 return NextResponse.json({processed:results})
}
