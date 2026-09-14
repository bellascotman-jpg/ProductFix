import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateFindings } from '@/lib/audit/engine'
export const runtime = 'nodejs'

export async function POST(_request: Request,{params}:{params:Promise<{auditId:string}>}){
  const {auditId}=await params; const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser()
  if(!user)return NextResponse.json({error:'Authentication required.'},{status:401})
  const {data:audit,error}=await supabase.from('audits').select('id,status,domain').eq('id',auditId).eq('user_id',user.id).single()
  if(error||!audit)return NextResponse.json({error:'Audit not found.'},{status:404})
  if(audit.status==='COMPLETED')return NextResponse.json({completed:true})
  if(audit.status!=='ANALYZING'&&audit.status!=='GENERATING_FINDINGS')return NextResponse.json({error:`Audit is not ready for analysis (${audit.status}).`},{status:409})
  await supabase.from('audits').update({status:'GENERATING_FINDINGS',current_stage:'GENERATING_FINDINGS'}).eq('id',auditId).eq('user_id',user.id)
  try{
    const result=await generateFindings(supabase,auditId)
    await supabase.from('audits').update({status:'SCORING',current_stage:'SCORING',overall_score:result.overallScore}).eq('id',auditId).eq('user_id',user.id)
    const {data:findings}=await supabase.from('audit_findings').select('severity,title,recommended_fix,source_url').eq('audit_id',auditId).order('priority',{ascending:true}).limit(100)
    const fix=(level:string)=>(findings??[]).filter(f=>f.severity===level||(level==='High'&&f.severity==='Critical')).map(f=>({title:f.title,fix:f.recommended_fix,sourceUrl:f.source_url}))
    await supabase.from('audits').update({status:'GENERATING_REPORT',current_stage:'GENERATING_REPORT'}).eq('id',auditId).eq('user_id',user.id)
    const summary=result.findingCount?`The public pages successfully crawled for ${audit.domain} produced ${result.findingCount} evidence-based finding${result.findingCount===1?'':'s'}. Recommendations are based only on observable page evidence.`:`No material issues were detected by the current public-page rules for ${audit.domain}.`
    const {data:report,error:reportError}=await supabase.from('reports').upsert({audit_id:auditId,user_id:user.id,status:'COMPLETED',executive_summary:summary,action_plan:{fixImmediately:fix('High'),fixNext:fix('Medium'),optimizeLater:fix('Low')},share_enabled:false},{onConflict:'audit_id'}).select('id').single()
    if(reportError||!report)throw reportError||new Error('Could not create the report.')
    await supabase.from('audits').update({status:'COMPLETED',current_stage:'COMPLETED',completed_at:new Date().toISOString()}).eq('id',auditId).eq('user_id',user.id)
    return NextResponse.json({completed:true,reportId:report.id,findingCount:result.findingCount,overallScore:result.overallScore})
  }catch(err){
    const message=err instanceof Error?err.message:'Unexpected audit analysis error.'
    await supabase.from('audits').update({status:'ANALYSIS_FAILED',current_stage:'GENERATING_FINDINGS',failed_at:new Date().toISOString(),error_code:'ANALYSIS_FAILED',error_message:message}).eq('id',auditId).eq('user_id',user.id)
    return NextResponse.json({error:'The audit could not be completed.',detail:message},{status:500})
  }
}
